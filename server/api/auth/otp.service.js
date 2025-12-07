const { hashOTP } = require('../../utils/hash');
const { generateOTP } = require('../../utils/jwt');
const prisma = require('../../utils/prisma');
const { sendEmail } = require('../../utils/emailService');
const bcrypt = require('bcrypt');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

const OTPService = {
  sendOTP: async ({ email, type = 'REGISTER', name }) => {

    // 1. Tạo mã OTP
    const otp = generateOTP();

    // 2. Hash OTP (PHẢI await)
    const hashed = await hashOTP(otp);

    // 3. Lưu vào DB
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    let record;
    try {
      record = await prisma.emailVerification.create({
        data: {
          email,
          otp: hashed,
          type, // ⚠️ ĐÃ SỬA → không còn hardcode REGISTER
          expiresAt,
        }
      });
    } catch (err) {
      throw new Error("Không thể tạo mã OTP");
    }

    // 4. Gửi email
    try {
      let subject, template;

      if (type === 'REGISTER') {
        subject = 'Xác thực tài khoản QAirline';
        template = 'verify';
      } else if (type === 'PASSWORD_RESET') {
        subject = 'Khôi phục mật khẩu QAirline';
        template = 'reset-password';
      }

      await sendEmail({
        to: email,
        subject,
        template,
        context: { name, otp, expiry: "5 phút" }
      });

      return { ok: true, msg: "OTP đã được gửi" };

    } catch (err) {

      // Nếu gửi email lỗi → xóa record OTP vừa tạo
      await prisma.emailVerification.delete({ where: { id: record.id } });

      throw new Error("Gửi email OTP thất bại");
    }
  },

  verifyOTP: async ({ email, type, otpInput }) => {

    // 1. Lấy OTP mới nhất chưa sử dụng
    const record = await prisma.emailVerification.findFirst({
      where: { email, type, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record)
      throw new Error("OTP không tồn tại hoặc đã dùng");

    // 2. Kiểm tra hết hạn
    if (new Date() > record.expiresAt)
      throw new Error("OTP đã hết hạn");

    // 3. So sánh OTP
    const isValid = await bcrypt.compare(otpInput, record.otp);
    if (!isValid)
      throw new Error("OTP không đúng");

    // 4. Disable OTP sau khi dùng → tránh dùng lại
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { used: true }
    });

    return { ok: true, msg: "OTP hợp lệ" };
  }
};

module.exports = OTPService;
