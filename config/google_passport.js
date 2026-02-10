const passport = require('passport');
const Google_Strategy = require('passport-google-oauth20').Strategy;
const User = require('../modules/user_module');
const asyncHandler = require('express-async-handler');
passport.use(new Google_Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  asyncHandler(async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Check if email exists
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(null, false, { message: 'Email not found in Google profile' });
        }

        user = new User({
          googleId: profile.id,
          name: profile.displayName || 'User',
          email: profile.emails[0].value,
          provider: 'google',
        });

        await user.save();
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  })
));

// serialize & deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;