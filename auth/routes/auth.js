const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTPUtils = require('../utils/otp');
const EmailUtils = require('../utils/email');
const crypto = require('crypto');

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: process.env.CLIENT_URL + '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// Apple OAuth
router.post('/apple', passport.authenticate('apple'));

router.post('/apple/callback',
  passport.authenticate('apple', { failureRedirect: process.env.CLIENT_URL + '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// Email/Password Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email,
      password,
      emailVerificationToken: verificationToken
    });

    await user.save();

    // Send verification email
    await EmailUtils.sendVerificationEmail(email, verificationToken, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Email/Password Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      const token = generateToken(user);
      
      // Update user stats
      user.lastLogin = new Date();
      user.loginCount += 1;
      user.save();

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified
        }
      });
    });
  })(req, res, next);
});

// Phone Login - Send OTP
router.post('/phone/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    const code = OTPUtils.generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create temporary user if doesn't exist
      user = new User({
        phone,
        name: `User-${phone}`,
        phoneVerificationCode: code,
        phoneVerificationExpires: expires
      });
    } else {
      user.phoneVerificationCode = code;
      user.phoneVerificationExpires = expires;
    }

    await user.save();

    // Send SMS
    const smsSent = await OTPUtils.sendSMS(phone, code);

    if (smsSent) {
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
});

// Phone Login - Verify OTP
router.post('/phone/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const user = await User.findOne({ 
      phone,
      phoneVerificationExpires: { $gt: new Date() }
    });

    if (!user || user.phoneVerificationCode !== code) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear verification data
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    user.isVerified = true;
    user.lastLogin = new Date();
    user.loginCount += 1;
    
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/verification-failed`);
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/verification-success`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/verification-failed`);
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = resetToken;
    await user.save();

    await EmailUtils.sendPasswordResetEmail(email, resetToken, user.name);

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = password;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isVerified: user.isVerified,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
