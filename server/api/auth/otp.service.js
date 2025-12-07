const { hashOTP } = require('../../utils/hash');
const { generateOTP } = require('../../utils/jwt');
const prisma = require('../../utils/prisma')
const { sendEmail } = require('../../utils/emailService')
const bcrypt = require('bcrypt')

const OTPService = {
  sendOTP: async (data) => {
    const {email, type, name, ticketNumber = null} = data
    const otp = generateOTP();

    await prisma.emailVerification.create({
      data: {
        email,
        otp: hashOTP(otp),
        type,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    let subject, template;
    if (type === 'REGISTER') {
      subject = 'Verify account QAirline';
      template = 'verify';
    } else if (type === 'PASSWORD_RESET') {
      subject = 'Reset password QAirline';
      template = 'reset-password';
    } else if (type == 'CANCEL_TICKET') {
      subject = 'Cancel code for ticket QAirline'
      template = 'cancel_ticket'
    }


const context = {
  name,
  otp,
  expiry: "5 minutes",
};

if (ticketNumber) context.ticketNumber = ticketNumber;


await sendEmail({
  to: email,
  subject,
  template,
  context
});
  },

  verifyOTP: async ({ email, type, otpInput }) => {
    const record = await prisma.emailVerification.findFirst({
      where: { email, type, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new Error('OTP is nonexistent or used');
    if (new Date() > record.expiresAt) throw new Error('OTP has been expired')

    const isValid = await bcrypt.compare(otpInput, record.otp);
    if (!isValid) throw new Error('OTP is invalid')

    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { used: true }
    });

  }
};

module.exports = OTPService;