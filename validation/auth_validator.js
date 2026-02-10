const { check, body } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const { default: slugify } = require('slugify');
const User = require('../modules/user_module');

exports.signup_validator = [
    check('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
   check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .custom((val) => {
        const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
        const domain = val.split('@')[1];
        if (!validDomains.includes(domain)) {
            throw new Error('Please use a valid email provider');
        }
        return true;
    }),
    check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('role')
    .optional()
    .isIn(['customer', 'staff', 'admin']).withMessage('Invalid role'),
    check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA', 'en-US']).withMessage('Invalid phone number'),
    check('address')
    .optional()
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters long'),
    validator_middelware
];
exports.login_validator = [
    check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .custom((val) => {
        const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
        const domain = val.split('@')[1];
        if (!validDomains.includes(domain)) {
            throw new Error('Please use a valid email provider');
        }
        return true;
    }),
    check('password')
    .notEmpty().withMessage('Password is required'),
    validator_middelware
];


exports.change_password_validator = [
    body('current_password')
    .notEmpty().withMessage('Current password is required')
    .custom(async (val, { req }) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(val, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        return true;
    }),
    body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validator_middelware
];

exports.reset_password_validator = [
    body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validator_middelware
];
exports.forgot_password_validator = [
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
    validator_middelware
];
exports.verify_reset_code_validator = [
    body('reset_code')
    .notEmpty().withMessage('Reset code is required'),
    validator_middelware
];
