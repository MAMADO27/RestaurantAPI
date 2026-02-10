const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require('../modules/user_module');
const crypto = require('crypto');

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
      profileFields: ["id", "displayName", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        // Try find by facebookId or email
        let user = await User.findOne({ $or: [{ facebookId: profile.id }, { email }] });
        if (user) {
          // attach facebookId if missing
          if (!user.facebookId) {
            user.facebookId = profile.id;
            await user.save();
          }
          return done(null, user);
        }
        // Create new user with a random password
        const randomPass = crypto.randomBytes(16).toString('hex');
        const newUser = await User.create({
          name: profile.displayName || 'Facebook User',
          email: email || `fb_${profile.id}@noemail.local`,
          password: randomPass,
          facebookId: profile.id
        });
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);
