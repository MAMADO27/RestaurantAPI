const express = require('express');
const router = express.Router();
const { protect } = require('../services/auth_services');
const allow_to = require('../middleware/allow_to');
const { create_cach_payment,create_paypal_payment,capture_paypal_payment,cancel_payment,return_from_paypal,paypal_webhook} = require('../services/payment_services');

const {create_cach_payment_validator,create_paypal_payment_validator,capture_paypal_payment_validator,cancel_payment_validator
} = require('../validation/payment_validator');
router.get('/paypal/return', return_from_paypal);
router.post('/paypal/webhook', paypal_webhook);

// Create cash payment
router.post('/cash',protect,create_cach_payment_validator,allow_to('customer', 'admin'),create_cach_payment);

// Create PayPal payment
router.post('/paypal',protect, create_paypal_payment_validator,allow_to('customer', 'admin'), create_paypal_payment);

// Capture PayPal payment
router.post('/paypal/capture',protect,capture_paypal_payment_validator,allow_to('customer', 'admin'),capture_paypal_payment);

// Cancel payment
router.post('/cancel', protect,cancel_payment_validator,allow_to('customer', 'admin'),cancel_payment);



module.exports = router;
