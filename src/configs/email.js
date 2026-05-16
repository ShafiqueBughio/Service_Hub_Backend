const Responses = require("@constants/responses");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
    // Unique Message-ID prevents Gmail from threading emails together
    const unique_message_id = `<${crypto.randomUUID()}@servicehub.com>`;
    const info = await transporter.sendMail({
      ...mail_details,
      messageId: unique_message_id,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(), // extra Gmail threading prevention
      },
    });
    return info;
  } catch (error) {
    throw responses.server_error_response(error.message);
  }
};

module.exports = send_email;
