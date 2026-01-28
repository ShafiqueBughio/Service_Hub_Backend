const Responses = require("@constants/responses");
const nodemailer = require("nodemailer");

const responses = new Responses();

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_ACCOUNT_EMAIL,
    pass: process.env.GMAIL_ACCOUNT_PASSWORD,
  },
});

const send_email = async (mail_details) => {
  try {
    const info = await transporter.sendMail(mail_details);
    return info;
  } catch (error) {
    throw responses.server_error_response(error.message);
  }
};

module.exports = send_email;
