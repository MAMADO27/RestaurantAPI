const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const {create_review,get_restaurant_reviews,get_my_reviews,update_review_by_id,delete_review_by_id} = require('../services/review_services');
const {create_review_validator,update_review_validator,delete_review_validator} = require('../validation/review_validator');
// Create a new review
router.post('/',protect,allow_to('customer','admin'),create_review_validator,create_review);
// Get reviews for a restaurant
router.get('/restaurant/:restaurant_id',get_restaurant_reviews);
// Get my reviews
router.get('/myreviews',protect,allow_to('customer','admin'),get_my_reviews);
// Update review by ID
router.put('/:id',protect,allow_to('customer','admin'),update_review_validator,update_review_by_id);
// Delete review by ID
router.delete('/:id',protect,allow_to('customer','admin'),delete_review_validator,delete_review_by_id);
module.exports = router;