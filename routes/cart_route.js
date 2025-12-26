const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const {add_to_cart,get_cart,update_cart_item,remove_from_cart,clear_cart} = require('../services/cart_services');
const {add_to_cart_validator,update_cart_validator} = require('../validation/cart_validator');
// Add to cart
router.post('/',add_to_cart_validator,protect,allow_to('customer','admin', 'staff'),add_to_cart);
// Get cart
router.get('/',protect,allow_to('customer,','admin', 'staff'),get_cart);
// Update cart item
router.put('/:itemId',update_cart_validator,protect,allow_to('customer','admin', 'staff'),update_cart_item);
// Remove from cart
router.delete('/:itemId',protect,allow_to('customer','admin', 'staff'),remove_from_cart);
// Clear cart
router.delete('/',protect,allow_to('customer','admin', 'staff'),clear_cart);
module.exports = router;