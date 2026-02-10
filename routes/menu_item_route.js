const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const { upload_multiple_images } = require('../middleware/upload_image_middleware');
const {
    create_menu_item,
    get_all_menu_items,
    get_menu_item_by_id,
    update_menu_item_by_id,
    delete_menu_item_by_id,
    upload_menu_item_image
} = require('../services/menu_item_services');
const {
    create_menu_item_validator,
    update_menu_item_validator,
    delete_menu_item_validator
} = require('../validation/menu_item_validator');
// Create menu item
router.post('/',
    upload_multiple_images([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 5 }]),
    upload_menu_item_image,
    create_menu_item_validator, protect, allow_to('admin', 'staff'), create_menu_item);
// Get menu item by ID
router.get('/:id', get_menu_item_by_id);
// Get all menu items by restaurant
router.get('/restaurant/:restaurant_id', get_all_menu_items);
// Update menu item
router.put('/:id',
    upload_multiple_images([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 5 }]),
    upload_menu_item_image,
    update_menu_item_validator, protect, allow_to('admin', 'staff'), update_menu_item_by_id
);
// Delete menu item
router.delete('/:id',delete_menu_item_validator,protect,allow_to('admin', 'staff'), delete_menu_item_by_id);

module.exports = router;