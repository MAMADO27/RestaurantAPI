const { body, param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const MenuItem = require('../modules/menu_items_module');
exports.add_to_cart_validator = [
    body('menuItemId')
        .notEmpty().withMessage('Menu item ID is required')
        .isMongoId().withMessage('Invalid menu item ID'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validator_middelware
];
exports.update_cart_validator = [
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validator_middelware
];