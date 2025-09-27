const speakeasy = require('speakeasy');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class OTPUtils {
  // Generate OTP for phone verification
  static generateOTP() {
    return speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      digits: 6,
      step: 300 // 5 minutes
    });
  }

  // Send OTP via SMS
  static async sendSMS(phoneNumber, code) {
    try {
      await client.messages.create({
        body: `Your Zeta GenAI verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  // Verify OTP
  static verifyOTP(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      token: token,
      digits: 6,
      step: 300,
      window: 1
    });
  }

  // Generate 2FA secret
  static generate2FASecret() {
    return speakeasy.generateSecret({
      name: 'Zeta GenAI',
      issuer: 'Zeta GenAI'
    });
  }

  // Verify 2FA token
  static verify2FA(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      token: token,
      window: 1
    });
  }
}

module.exports = OTPUtils;
