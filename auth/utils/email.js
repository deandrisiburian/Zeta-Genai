const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailUtils {
  static async sendVerificationEmail(email, token, name) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify Your Email - Zeta GenAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Zeta GenAI!</h2>
          <p>Hello ${name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
          <p>Or copy this link: ${verificationUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(email, token, name) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Your Password - Zeta GenAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Click the button below:</p>
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
          <p>Or copy this link: ${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }
}

module.exports = EmailUtils;
