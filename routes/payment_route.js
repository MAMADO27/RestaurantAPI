const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const {create_payment,confirm_payment,request_refund} = require('../services/payment_services');
router.post('/create',protect,allow_to('customer','admin'),create_payment);
router.post('/confirm',protect,allow_to('customer','admin'),confirm_payment);
router.post('/refund',protect,allow_to('customer','admin'),request_refund);
module.exports = router;