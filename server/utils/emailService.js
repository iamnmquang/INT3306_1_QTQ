const nodemailer = require('nodemailer')
const path = require('path');
const fs = require('fs').promises;
const { compile } = require('handlebars');


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const renderTemplate = async (templateName, context = {}) => {
  const filePath = path.join(process.cwd(), 'emails', 'templates', `${templateName}.html`);
  const source = await fs.readFile(filePath, 'utf8');
  const template = compile(source);
  return template(context);
}

const sendEmail = async ({ to, subject, template, context }) => {
  const html = await renderTemplate(template, context);

  const mailOptions = {
    from: `"QAirline" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent: ${info.messageId}`);
  return info;
}

module.exports = { sendEmail }