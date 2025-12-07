// testEmail.js
require('dotenv').config();  // Load .env
const { sendEmail } = require('./utils/emailService');

(async () => {
    try {
        const info = await sendEmail({
            to: 'nmq120105@gmail.com',  // Thay bằng email bạn muốn test
            subject: 'Test Email QAirline',
            template: 'verify',           // Tên template trong folder emails/templates/verify.html
            context: {
                name: 'Minh Quang',
                otp: '123456',
                expiry: '5 minutes'
            }
        });

        console.log('✅ Gửi email thành công:', info.messageId);
    } catch (err) {
        console.error('❌ Lỗi gửi email:', err);
    }
})();
