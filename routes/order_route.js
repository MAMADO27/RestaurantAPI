const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const {
    create_order,
    get_users_order,
    get_restaurant_orders,
    get_order_by_id,
    update_order_status,
    cansel_order,
    get_order_stats
} = require('../services/order_services');
const {
    create_order_validator,
    get_order_by_id_validator,
    update_order_status_validator,
    cansel_order_validator,
    get_restaurant_orders_validator,
    get_order_stats_validator
} = require('../validation/order_validator');
// Create order
router.post('/',create_order_validator,protect,allow_to('customer','admin'),create_order);
// Get user orders
router.get('/my-orders',protect,allow_to('customer','admin'),get_users_order);
// Get orders for restaurant
router.get('restaurant/:restaurant_id',protect,get_restaurant_orders_validator,allow_to('admin','staff'),get_restaurant_orders);
// Get order by ID
router.get('/:id',get_order_by_id_validator,protect,allow_to('customer','admin','staff'),get_order_by_id);
// Update order status
router.put('/:id/status',update_order_status_validator,protect,allow_to('admin','staff'),update_order_status);
// Cansel order
router.put('/:id/cancel',cansel_order_validator,protect,allow_to('customer',"admin",'staff'),cansel_order);
// Get order stats
router.get('/stats/:restaurant_id',get_order_stats_validator,protect,allow_to('admin','staff'),get_order_stats);
module.exports = router;