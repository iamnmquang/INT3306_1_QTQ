const { hashOTP } = require('../../utils/hash');
const { generateOTP } = require('../../utils/jwt');
const prisma = require('../../utils/prisma');
const { sendEmail } = require('../../utils/emailService');
const bcrypt = require('bcrypt');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

const OTPService = {
  sendOTP: async (data) => {
    const { email, type, name, ticketNumber = null } = data;

    const otp = generateOTP();
    const hashed = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // 🔥 FIX 1: Xoá OTP cũ
    await prisma.emailVerification.deleteMany({
      where: { email, type }
    });

    // Lưu OTP
    await prisma.emailVerification.create({
      data: {
        email,
        otp: hashed,
        type,
        expiresAt,
      }
    });

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

    const context = { name, otp, expiry: '5 minutes' };
    if (ticketNumber) context.ticketNumber = ticketNumber;

    // 🔥 FIX 2: log lỗi mail
    try {
      await sendEmail({ to: email, subject, template, context });
    } catch (err) {
      console.error("❌ EMAIL ERROR:", err);
      throw new Error("Không gửi được email OTP");
    }
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
