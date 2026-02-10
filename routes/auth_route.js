const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth_services = require('../services/auth_services');
const {signup,login,forget_password,reset_password} = require('../services/auth_services');
const { signup_validator, login_validator,forgot_password_validator, reset_password_validator,verify_reset_code_validator} = require('../validation/auth_validator');

router.route('/signup').post(signup_validator, signup);
router.route('/login').post(login_validator, login);
router.route('/forget-password').post(forgot_password_validator,forget_password);
router.route('/verify-reset-code').post(verify_reset_code_validator,auth_services.verify_reset_code);
router.route('/reset-password').post(reset_password_validator,reset_password);


router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['email']
    })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/api/auth/facebook/failed',
        session: false 
    }),
    (req, res) => {
        if (!req.user) return res.status(400).json({ message: 'No user returned from Facebook' });
        res.status(200).json({ success: true, user: req.user });
    }
);

router.get('/facebook/failed', (req, res) => {
    res.status(401).json({ success: false, message: 'Facebook authentication failed' });
});

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/google/failed',
        session: false
    }),
    (req, res) => {
        if (!req.user) return res.status(400).json({ message: 'No user returned from Google' });
        res.status(200).json({ success: true, user: req.user });
    }
);

router.get('/google/failed', (req, res) => {
    res.status(401).json({ success: false, message: 'Google authentication failed' });
});

module.exports = router;