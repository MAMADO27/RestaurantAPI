const express = require('express');
const router = express.Router();
const restaurant_services = require('../services/restaurant_services');
const { protect } = require('../services/auth_services');
const {
    create_restaurant, get_all_restaurants, get_restaurant_by_id, update_restaurant_by_id, delete_restaurant_by_id
} = restaurant_services;
const allow_to = require('../middleware/allow_to');

// Create a new restaurant
router.route('/').post(protect,allow_to('admin') ,create_restaurant);
// Get all restaurants
router.route('/').get(get_all_restaurants);
// Get restaurant by ID
router.route('/:id').get(get_restaurant_by_id);
// Update restaurant by ID
router.route('/:id').put(protect,allow_to('admin') ,update_restaurant_by_id);
// Delete restaurant by ID
router.route('/:id').delete(protect,allow_to('admin') ,delete_restaurant_by_id);

module.exports = router;