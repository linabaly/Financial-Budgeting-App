import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("✅ EMAIL_USER:", process.env.EMAIL_USER);
console.log("✅ EMAIL_PASS loaded:", !!process.env.EMAIL_PASS);


export async function sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📨 Email sent to ${to}: ${info.response}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${to}:`, err);
    }
  }  