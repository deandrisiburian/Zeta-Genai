const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AppleStrategy = require('passport-apple');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }

    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0].value,
      isVerified: true
    });

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails?.[0]?.value });
    
    if (user) {
      user.githubId = profile.id;
      await user.save();
      return done(null, user);
    }

    user = await User.create({
      githubId: profile.id,
      email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
      name: profile.displayName || profile.username,
      avatar: profile.photos[0].value,
      isVerified: true
    });

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Apple Strategy
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  key: process.env.APPLE_PRIVATE_KEY,
  callbackURL: "/auth/apple/callback",
  scope: ['name', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ appleId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.email });
    
    if (user) {
      user.appleId = profile.id;
      await user.save();
      return done(null, user);
    }

    user = await User.create({
      appleId: profile.id,
      email: profile.email,
      name: profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : 'Apple User',
      isVerified: true
    });

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Local Strategy (Email/Password)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    if (!user.password) {
      return done(null, false, { message: 'Please use social login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Invalid password' });
    }

    if (!user.isVerified) {
      return done(null, false, { message: 'Please verify your email' });
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));
