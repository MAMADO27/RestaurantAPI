const { check, body,param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const Order = require('../modules/order_modules');

exports.create_order_validator = [
    body('deliveryAddress')
        .notEmpty().withMessage('Delivery address is required')
        .isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
    body('notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Notes too long'),
    validator_middelware
];

exports.get_order_by_id_validator = [
    param('id')
        .isMongoId().withMessage('Invalid order ID'),
    validator_middelware
];
exports.update_order_status_validator = [
    param('id')
        .isMongoId().withMessage('Invalid order ID'),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'preparing', 'on the way', 'delivered', 'cancelled']).withMessage('Invalid status value'),
    validator_middelware
];
exports.cansel_order_validator = [
    param('id')
        .isMongoId().withMessage('Invalid order ID'),
    validator_middelware
];
exports.get_order_stats_validator = [
    param('restaurant_id')
        .isMongoId().withMessage('Invalid restaurant ID'),
    validator_middelware
];
