const { hashOTP } = require('../../utils/hash');
const { generateOTP } = require('../../utils/jwt');
const prisma = require('../../utils/prisma');
const { sendEmail } = require('../../utils/emailService');
const bcrypt = require('bcrypt');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 giây, có thể điều chỉnh hoặc bỏ

const OTPService = {
  sendOTP: async (data) => {
    const { email, type, name, ticketNumber = null } = data;

    // 🔹 Lấy OTP mới nhất (chưa dùng)
    const latestOTP = await prisma.emailVerification.findFirst({
      where: { email, type, used: false },
      orderBy: { createdAt: 'desc' },
    });

    // 🔹 Nếu muốn cooldown, bật dòng dưới
    if (latestOTP && Date.now() - latestOTP.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new Error("Vui lòng đợi trước khi gửi lại OTP");
    }

    // 🔹 Xoá OTP cũ
    await prisma.emailVerification.deleteMany({
      where: { email, type }
    });

    // 🔹 Tạo OTP mới
    const otp = generateOTP();
    const hashed = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.emailVerification.create({
      data: {
        email,
        otp: hashed,
        type,
        expiresAt,
      }
    });

    // 🔹 Chọn subject + template
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

    // 🔹 Gửi mail
    try {
      await sendEmail({ to: email, subject, template, context });
    } catch (err) {
      console.error("❌ EMAIL ERROR:", err);
      throw new Error("Không gửi được email OTP");
    }

    return { message: "OTP mới đã được gửi đến email của bạn" };
  },

  verifyOTP: async ({ email, type, otpInput }) => {
    const record = await prisma.emailVerification.findFirst({
      where: { email, type, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record)
      throw new Error("OTP không tồn tại hoặc đã dùng");

    if (new Date() > record.expiresAt)
      throw new Error("OTP đã hết hạn");

    const isValid = await bcrypt.compare(otpInput, record.otp);
    if (!isValid)
      throw new Error("OTP không đúng");

    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { used: true }
    });

    return { ok: true, msg: "OTP hợp lệ" };
  }
};

module.exports = OTPService;
