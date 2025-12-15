const { hashOTP } = require('../../utils/hash');
const { generateOTP } = require('../../utils/jwt');
const prisma = require('../../utils/prisma');
const { sendEmail } = require('../../utils/emailService');
const bcrypt = require('bcrypt');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

const OTPService = {
  sendOTP: async (data) => {
    const { email, type, name, ticketNumber = null } = data;

    // 1. Generate OTP
    const otp = generateOTP();

    // 2. Hash OTP
    const hashed = await hashOTP(otp);

    // 3. Lưu OTP vào DB
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    try {
      await prisma.emailVerification.create({
        data: {
          email,
          otp: hashed,
          type,
          expiresAt,
        }
      });
    } catch (err) {
      throw new Error("Không thể tạo mã OTP");
    }

    // 4. Chọn template + subject theo loại OTP
    let subject, template;
    if (type === 'REGISTER') {
      subject = 'Verify account QAirline';
      template = 'verify';
    } else if (type === 'PASSWORD_RESET') {
      subject = 'Reset password QAirline';
      template = 'reset-password';
    } else if (type === 'CANCEL_TICKET') {
      subject = 'Cancel code for ticket QAirline';
      template = 'cancel_ticket';
    } else {
      throw new Error('Loại OTP không hợp lệ');
    }

    // 5. Context gửi email
    const context = {
      name,
      otp,
      expiry: '5 minutes',
    };

    if (ticketNumber) context.ticketNumber = ticketNumber;

    // 6. Gửi email
    await sendEmail({
      to: email,
      subject,
      template,
      context,
    });
  },

  verifyOTP: async ({ email, type, otpInput }) => {
    // 1. Lấy OTP mới nhất chưa dùng
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

    // 4. Đánh dấu OTP đã dùng
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { used: true }
    });

    return { ok: true, msg: "OTP hợp lệ" };
  }
};

module.exports = OTPService;
