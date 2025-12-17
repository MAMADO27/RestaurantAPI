const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const {
    create_menu_item,
    get_all_menu_items,
    get_menu_item_by_id,
    update_menu_item_by_id,
    delete_menu_item_by_id
} = require('../services/menu_item_services');
const {
    create_menu_item_validator,
    update_menu_item_validator,
    delete_menu_item_validator
} = require('../validation/menu_item_validator');
// Create menu item
router.post('/',create_menu_item_validator,protect,allow_to('admin', 'staff'),create_menu_item);
// Get all menu items
router.get('/', get_all_menu_items);
// Get menu item by ID
router.get('/:id', get_menu_item_by_id);
// Update menu item
router.put('/:id',update_menu_item_validator,protect,allow_to('admin', 'staff'),update_menu_item_by_id
);
// Delete menu item
router.delete('/:id',delete_menu_item_validator,protect,allow_to('admin', 'staff'), delete_menu_item_by_id);

module.exports = router;