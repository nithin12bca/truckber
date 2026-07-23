const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const templates = {
  welcome: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚛 TruckBer</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Welcome, ${data.name}!</h2>
        <p>Your TruckBer account has been created successfully.</p>
        <p>You can now book trucks, track shipments, and manage your logistics with ease.</p>
        <a href="${process.env.FRONTEND_URL}" 
           style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
          Get Started
        </a>
      </div>
      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
        © ${new Date().getFullYear()} TruckBer. All rights reserved.
      </div>
    </div>
  `,

  resetPassword: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚛 TruckBer</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>You requested a password reset. Click the button below to reset your password. This link expires in 30 minutes.</p>
        <a href="${data.resetUrl}" 
           style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `,

  bookingUpdate: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚛 TruckBer</h1>
      </div>
      <div style="padding: 30px;">
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        <p><strong>Booking #:</strong> ${data.bookingNumber}</p>
        <a href="${process.env.FRONTEND_URL}/bookings/${data.bookingId}" 
           style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
          View Booking
        </a>
      </div>
    </div>
  `,
};

exports.sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const emailHtml = html || (templates[template] ? templates[template](data) : data?.message || '');
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error('Email error:', error.message);
    return false;
  }
};
