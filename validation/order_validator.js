const { check, body,param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const Order = require('../modules/order_modules');
const Copon = require('../modules/copon_module');

exports.create_order_validator = [
    body('deliveryAddress')
        .notEmpty().withMessage('Delivery address is required')
        .isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
    body('notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Notes too long'),
    body('payment_method')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['card', 'cash_on_delivery', 'paypal']).withMessage('Invalid payment method'),
    body('copon_code')
        .optional()
        .isAlphanumeric().withMessage('Copon code must be alphanumeric')
        .isLength({ max: 20 }).withMessage('Copon code too long')
        .custom(async (val) => {
            const copon = await Copon.findOne({ code: val.toUpperCase(), active: true });
            if (!copon) {
                throw new Error('Invalid or inactive copon code');
            }
            if (new Date() > copon.expiration_date) {
                throw new Error('Copon code has expired');
            }
            if (copon.usage_limit && copon.times_used >= copon.usage_limit) {
                throw new Error('Copon usage limit reached');
            }
            return true;
        }),

    validator_middelware
];

exports.get_restaurant_orders_validator = [
    param('restaurant_id')
        .isMongoId().withMessage('Invalid restaurant ID'),
    check('restaurant_id').custom(async (val) => {
        const restaurantExists = await Order.exists({ restaurant: val });
        if (!restaurantExists) {
            throw new Error('Restaurant does not exist or has no orders');
        }
        return true;
    }),
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
    check('restaurant_id').custom(async (val) => {
        const restaurantExists = await Order.exists({ restaurant: val });
        if (!restaurantExists) {
            throw new Error('Restaurant does not exist or has no orders');
        }
        return true;
    }),
    validator_middelware
];
