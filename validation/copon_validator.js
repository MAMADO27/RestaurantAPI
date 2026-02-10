const { body, param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const Copon = require('../modules/copon_module');

exports.create_copon_validator = [
    body('code')
        .notEmpty().withMessage('Copon code is required')
        .isLength({ min: 3 }).withMessage('Copon code must be at least 3 characters long'),
    body('discount_value')
        .notEmpty().withMessage('Discount value is required')
        .isFloat({ gt: 0 }).withMessage('Discount value must be a positive number'),
    body('expiration_date')
        .notEmpty().withMessage('Expiration date is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((val) => {
            if (new Date(val) <= new Date()) {
                throw new Error('Expiration date must be in the future');
            }
            return true;
        }   ),
    body('usage_limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
    validator_middelware
];
exports.apply_copon_validator = [
    body('code')
        .notEmpty().withMessage('Copon code is required'),
    validator_middelware
];
exports.deactivate_copon_validator = [
    body('code')
        .notEmpty().withMessage('Copon code is required'),
    validator_middelware
];
exports.delete_copon_validator = [
    body('code')
        .notEmpty().withMessage('Copon code is required'),
    validator_middelware
];
