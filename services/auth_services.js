const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../modules/user_module');
const create_token = require('../utils/create_token');
const api_error = require('../utils/api_error');
const send_email = require('../utils/send_email');
const crypto = require('crypto');
// signup 
// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    const role = req.body.role || 'customer';
    // Check if user already exists
    const user_exists = await User.findOne({ email });
    if(user_exists) {
       return next( new api_error('User already exists',400));
    }
    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
        name,
        email,
        password,
        role,
        phone: req.body.phone,
        address: req.body.address
    }); 
    send_email({
        email: user.email,
        subject: 'Welcome to Our Restaurant!',
        message: `<h3>Welcome ${user.name}!</h3>
                  <p>Thank you for signing up to our restaurant app.</p>
                  <p>You can now browse our menu, place orders, and track your deliveries.</p>
                  <p>Enjoy your experience!</p>`
    }).catch(err => console.error('Email error:', err));

    if(user) {
        const token = create_token({ id: user._id });
        res.status(201).json({
            _id: user._id,name: user.name, email: user.email,token,
            phone: user.phone, address: user.address, role: user.role

        });
    } else {
        
        return next(new api_error('Invalid user data',400));
    }
  
   
});
// login
// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Check for user email
    const user = await User.findOne({ email });
    if(!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = create_token({ id: user._id });
    user.password = undefined;
    res.status(200).json({
        success: true,
        _id: user._id,name: user.name, email: user.email,token,phone: user.phone, address: user.address, role: user.role
    });
});
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const crrunt_user= await User.findById(decoded.id).select('-password');
        if (!crrunt_user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        if(crrunt_user.passwordChangedAt){
            const passwordChangedAt = parseInt(crrunt_user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < passwordChangedAt) {
                return res.status(401).json({ message: 'Not authorized, password changed' });
            }
        }
        req.user = crrunt_user;
        next();
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
});
exports.forget_password = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const reset_code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const hashed_reset_code=crypto.createHash('sha256').update(reset_code).digest('hex');
    user.password_reset_code = hashed_reset_code;
    user.password_reset_expires = Date.now() + 10 * 60 * 1000;
    user.password_reset_verified = false;
    await user.save({validateBeforeSave:false});
    // Send reset code via email
    const message = `<h3>Password Reset Request</h3>
                     <p>Your password reset code is:</p>
                     <h2 style="color: #007bff; text-align: center; letter-spacing: 2px;">${reset_code}</h2>
                     <p>This code will expire in 10 minutes.</p>
                     <p>If you didn't request this, please ignore this email.</p>`;
    try {
        await send_email({
            email: user.email,
            subject: 'Password Reset Code',
            message,
            html: message
        });
        res.status(200).json({success: true, message: 'Password reset code sent to email' });
    } catch (error) {
        user.password_reset_code = undefined;
        user.password_reset_expires = undefined;
        await user.save({validateBeforeSave:false});
        return res.status(500).json({ message: 'Email could not be sent' });
    }
});

exports.verify_reset_code = asyncHandler(async (req, res) => {
    const hashed_reset_code=crypto.createHash('sha256').update(req.body.reset_code).digest('hex');
    const user = await User.findOne({ 
        password_reset_code: hashed_reset_code,
        password_reset_expires: { $gt: Date.now() }
    });
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    user.password_reset_verified = true;
    await user.save({validateBeforeSave:false});
    res.status(200).json({ success: true,message: 'Reset code verified' });
});

exports.reset_password = asyncHandler(async (req, res) => {
    const { email, new_password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (!user.password_reset_verified) {
        return res.status(400).json({ message: 'Reset code not verified' });
    }
    user.password = new_password;
    user.password_reset_code = undefined;
    user.password_reset_expires = undefined;
    user.password_reset_verified = false;
    await user.save();
    const token = create_token({ id: user._id });
    res.status(200).json({
        success: true,
        message: 'Password reset successful', token});

});

