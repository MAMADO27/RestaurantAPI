const { body, param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const Review = require('../modules/review_module');

exports.create_review_validator = [
    body('restaurantId')
        .optional()
        .notEmpty().withMessage('Restaurant ID is required')
        .isMongoId().withMessage('Invalid Restaurant ID'),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .notEmpty().withMessage('Comment is required')
        .isLength({ min: 10 }).withMessage('Comment must be at least 10 characters long'),
    validator_middelware
];

exports.update_review_validator = [
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .isLength({ min: 10 }).withMessage('Comment must be at least 10 characters long'),
    validator_middelware
];

exports.delete_review_validator = [
    param('id').notEmpty().withMessage('Review ID is required').isMongoId().withMessage('Invalid Review ID'),
    validator_middelware
];