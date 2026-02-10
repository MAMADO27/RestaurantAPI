const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const {create_copon,apply_copon,get_copons,deactivate_copon,delete_copon} = require('../services/copon_services');

const {create_copon_validator,apply_copon_validator,deactivate_copon_validator,delete_copon_validator} = require('../validation/copon_validator');

// Create copon
router.post('/',create_copon_validator,protect,allow_to('admin'),create_copon);
// Get all copons
router.get('/',protect,allow_to('admin'),get_copons);
// Apply copon
router.post('/apply',apply_copon_validator,protect,allow_to('customer','admin'),apply_copon);
// Deactivate copon
router.put('/deactivate',deactivate_copon_validator,protect,allow_to('admin'),deactivate_copon);
// Delete copon
router.delete('/:id',delete_copon_validator,protect,allow_to('admin'),delete_copon);
module.exports = router;