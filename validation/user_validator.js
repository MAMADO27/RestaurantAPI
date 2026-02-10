const { check, body } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const { default: slugify } = require('slugify');
const User = require('../modules/user_module');

exports.update_user_validator = [
    body('name')
    .optional()
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
    body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validator_middelware
];