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
    .custom(async (val) => {
        const user = await User.findOne({ email: val });
        if (user) {
            throw new Error('Email already in use');
        }
        return true;
    }),
    check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validator_middelware
];
exports.login_validator = [
    check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
    check('password')
    .notEmpty().withMessage('Password is required'),
    validator_middelware
];
exports.update_user_validator = [
    body('name')
    .optional()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email')
    .optional()
    .isEmail().withMessage('Invalid email address')
    .custom(async (val, { req }) => {
        const user = await User.findOne({ email: val });
        if (user && user._id.toString() !== req.user._id.toString()) {
            throw new Error('Email already in use');
        }
        return true;
    }),
    body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validator_middelware
];
