const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../modules/user_module');
const create_token = require('../utils/create_token');
const api_error = require('../utils/api_error');
// signup 
// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const role = req.body.role || 'user';
    // Check if user already exists
    const user_exists = await User.findOne({ email });
    if(user_exists) {
       return new api_error('User already exists',400);
    }
    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    if(user) {
        const token = create_token({ id: user._id });
        res.status(201).json({
            _id: user._id,name: user.name, email: user.email,token
        });
    } else {
        
        return new api_error('Invalid user data',400);
    }
});
// login
// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Check for user email
    const user = await User.findOne({ email:req.body.email });
    if(!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = create_token({ id: user._id });
    user.password = undefined;
    res.status(200).json({
        _id: user._id,name: user.name, email: user.email,token
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

