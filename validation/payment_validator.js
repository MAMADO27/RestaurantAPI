const { body, check } = require('express-validator');
const validator_middleware = require('../middleware/validator_middelware');
const Order = require('../modules/order_modules');

exports.create_cach_payment_validator = [
    body('order_id')
        .notEmpty().withMessage('Order ID is required')
        .isMongoId().withMessage('Invalid Order ID')
        .custom(async (val, { req }) => {const order = await Order.findById(val);
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.payment_status === 'paid') {
                throw new Error('Order is already paid');
            }
            if (order.payment_method !== 'cash_on_delivery') {
                throw new Error('Invalid payment method for this order');
            }
            if (order.customer.toString() !== req.user.id) {
                throw new Error('You are not authorized to pay for this order');
            }
            
            return true;
        }),
    validator_middleware
];


exports.create_paypal_payment_validator = [
    body('order_id')
        .notEmpty().withMessage('Order ID is required')
        .isMongoId().withMessage('Invalid Order ID')
        .custom(async (val, { req }) => {const order = await Order.findById(val);
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.payment_status === 'paid') {
                throw new Error('Order already paid');
            }
            if (order.customer.toString() !== req.user.id) {
                throw new Error('You are not authorized to pay for this order');
            }
            return true;
        }),
    validator_middleware
];

exports.capture_paypal_payment_validator = [
    body('order_id')
        .notEmpty().withMessage('Order ID is required')
        .isMongoId().withMessage('Invalid Order ID'),
    body('paypal_order_id')
        .notEmpty().withMessage('PayPal Order ID is required'),
    body('order_id')
        .custom(async (val, { req }) => {
            const order = await Order.findById(val);
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.customer.toString() !== req.user.id) {
                throw new Error('You are not authorized to capture this payment');
            }
            
            return true;
        }),
    validator_middleware
];

exports.cancel_payment_validator = [
    body('order_id')
        .notEmpty().withMessage('Order ID is required')
        .isMongoId().withMessage('Invalid Order ID')
        .custom(async (val, { req }) => {
            const order = await Order.findById(val);
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.payment_status === 'paid') {
                throw new Error('Cannot cancel paid order');
            }
            const is_owner = order.customer.toString() === req.user.id;
            const is_admin = req.user.role === 'admin';
            if (!is_owner && !is_admin) {
                throw new Error('You are not authorized to cancel this payment');
            }
            return true;
        }),
    validator_middleware
];