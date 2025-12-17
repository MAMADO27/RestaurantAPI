const { check, body,param } = require('express-validator');
const validator_middelware = require('../middleware/validator_middelware');
const { default: slugify } = require('slugify');
const MenuItem = require('../modules/menu_items_module');
const Restaurant = require('../modules/restauant_module');
exports.create_menu_item_validator = [
    body('name').notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('description')
        .optional(),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .notEmpty().withMessage('Category is required'),
    body('restaurant')
        .notEmpty().withMessage('Restaurant ID is required').isMongoId().withMessage('Invalid Restaurant ID')
        .custom(async (val) => {
            const restaurant = await Restaurant.findById(val); 
            if (!restaurant) {
                throw new Error('Restaurant does not exist');
            }
            return true;
        }),
    body('availability')
        .optional().isBoolean().withMessage('Availability must be a boolean value'),
    body('image_url').optional().isURL().withMessage('Invalid image URL'),
    validator_middelware
];

exports.update_menu_item_validator = [
    param('id')
        .isMongoId().withMessage('Invalid menu item ID'),
    body('name')
        .optional()
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('description').optional(),

    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('category').optional(),

    body('availability')
        .optional().isBoolean().withMessage('Availability must be a boolean value'),
    body('image_url')
        .optional().isURL().withMessage('Invalid image URL'),
    validator_middelware
];
exports.delete_menu_item_validator = [
    param('id')
        .isMongoId().withMessage('Invalid menu item ID'),
    validator_middelware
];