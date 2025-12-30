const { generateTokens, generateOTP } = require('../../utils/jwt')
const AuthService = require('./auth.service')
const UserService = require('../user/user.service')
const OTPService = require('./otp.service')
const bcrypt = require('bcrypt')


const AuthController = {
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "You must provide an email and a password." });
      }

      const existingUser = await UserService.getbyEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
      }

      // 1. Tạo user vào Database
      const user = await UserService.create({
        name,
        email,
        password,
      });

      // 2. Gửi OTP (Bọc trong try/catch riêng để xử lý lỗi gửi mail)
      try {
        await OTPService.sendOTP({ email, type: 'REGISTER', name: user.name });
      } catch (otpError) {
        console.error("LỖI GỬI EMAIL:", otpError.message);

        // --- QUAN TRỌNG: XÓA USER VỪA TẠO ---
        // Nếu không xóa, user này sẽ thành "rác", lần sau đăng ký lại sẽ báo trùng email
        await UserService.delete(user.id);

        return res.status(500).json({
          message: "Lỗi gửi email xác thực. Vui lòng kiểm tra lại email hoặc thử lại sau."
        });
      }

      return res.json({
        message: "Register successfully. Please check your email to verify account."
      })

    } catch (err) {
      next(err);
    }
  },

  verifyRegisterEmail: async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Missing email or OTP" });
      }

      await OTPService.verifyOTP({ email, type: 'REGISTER', otpInput: otp })


      await UserService.updateByEmail(email, { isAccountVerified: true });
      return res.json({ message: "Xac thuc thanh cong" });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'You must provide email or password' });
      }

      const existingUser = await UserService.getbyEmail(email);
      if (!existingUser) {
        return res.status(403).json({ message: 'Invalid login credentials' })
      }



      if (!existingUser.isAccountVerified) {
        await OTPService.sendOTP({ email, type: 'REGISTER', name: existingUser.name });
        return res.status(403).json({
          message: 'Account not verified. Please check your email to verify your account.'
        });
      }

      const validPassword = await bcrypt.compare(password, existingUser.password);
      if (!validPassword) {
        return res.status(403).json({ message: 'Invalid login credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(existingUser);
      await AuthService.addRefreshTokenToWhiteList({
        refreshToken,
        userId: existingUser.id
      });

      
      const { password: _, ...safeUser } = existingUser;

    
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.json({
        accessToken,
        user: safeUser,   
      });

    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  },

  //get another pairs of tokens to keep user logged
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Missing refresh token' })
      }

      const savedRefreshOToken = await AuthService.findRefreshToken(refreshToken);

      if (!savedRefreshOToken
        || savedRefreshOToken.revoked === true
        || Date.now() >= savedRefreshOToken.expireAt.getTime()
      ) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await UserService.getById(savedRefreshOToken.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      //revoked refresh token and create new pair of tokens
      await AuthService.deleteRefreshTokenById(savedRefreshOToken.id);

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      await AuthService.addRefreshTokenToWhiteList({ refreshToken: newRefreshToken, userId: user.id })

      // Set new refresh token cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 1 month
      });

      return res.json({
        accessToken
      });

    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      await AuthService.revokeTokens(userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.json({
        success: true,
        message: "Logout successfully"
      })
    } catch (err) {
      next(err)
    }
  },

  //send email to reset password
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await UserService.getbyEmail(email);
      if (!user) return res.status(404).json({ message: "Email is not existed." });

      await OTPService.sendOTP({ email, type: 'PASSWORD_RESET', name: user.name });

      return res.json({ message: "Reset password OTP is send to email." });
    } catch (err) {
      next(err);
    }
  },

  verifyResetEmail: async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      await OTPService.verifyOTP({ email, type: 'PASSWORD_RESET', otpInput: otp });

      return res.json({ message: "OTP is valid" });
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { email, newPassword } = req.body;

      const user = await UserService.getbyEmail(email);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await UserService.updatePasswordByEmail(email, newPassword);

      //revoke all refresh tokens of user
      await AuthService.revokeTokens(user.id);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.json({ 
        success: true,
        message: "Đổi mật khẩu thành công!" });
    } catch (err) {
      next(err);
    }
  },

 
};


module.exports = AuthController