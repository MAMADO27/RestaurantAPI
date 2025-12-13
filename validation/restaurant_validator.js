const { check, body,param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const { default: slugify } = require('slugify');
const Restaurant = require('../modules/restauant_module');

exports.create_restaurant_validator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('address')
        .notEmpty().withMessage('Address is required'),
    body('cuisine')
        .notEmpty().withMessage('Cuisine is required'),
    body('phone')
        .optional()
        .isMobilePhone().withMessage('Invalid phone number'),
    validator_middelware
];

exports.update_restaurant_validator = [
    param('id')
        .isMongoId().withMessage('Invalid restaurant ID'),
    body('name')
        .optional()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('address')
        .optional(),
    body('cuisine')
        .optional(),
    body('phone')
        .optional()
        .isMobilePhone().withMessage('Invalid phone number'),
    validator_middelware
];

exports.delete_restaurant_validator = [
    param('id')
        .isMongoId().withMessage('Invalid restaurant ID'),
    validator_middelware
];