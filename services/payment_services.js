const Order = require('../modules/order_modules');
const mongoose = require('mongoose');
const api_error = require('../utils/api_error');
const asyncHandler = require('express-async-handler');
const api_features = require('../utils/api_features');
const { create_paypal_order, capture_paypal_order } = require('../utils/paypal');
const paypal = require('@paypal/checkout-server-sdk');

exports.create_cach_payment = asyncHandler(async (req, res, next) => {
    const {order_id,payment_method}=req.body;
    const order = await Order.findById(order_id);
    if (!order) {
        return next(new api_error('Order not found', 404));
    }
    if (order.payment_method !== 'cash_on_delivery') {
        return next(new api_error('Invalid payment method for this order', 400));
    }
    if (order.payment_status === 'paid') {
        return next(new api_error('Order is already paid', 400));
    }
    order.payment_status = 'paid';
    order.payment_method = 'cash_on_delivery';
    order.pay_at=Date.now();
    await order.save();
    res.status(200).json({ success: true, message: 'Payment successful', order_id, payment_method});
});

exports.create_paypal_payment = asyncHandler(async (req, res, next) => {
  const { order_id } = req.body;
  const order = await Order.findById(order_id);
  if (!order) {
    return next(new api_error('Order not found', 404));
  }
  if (order.payment_status === 'paid') {
    return next(new api_error('Order already paid', 400));
  }
  const paypal_order = await create_paypal_order(order.totalPrice, order._id);
  const approveLink = paypal_order.links.find(l => l.rel === 'approve' || l.rel === 'payer-action');
  res.status(200).json({
    success: true,
    paypal_order_id: paypal_order.id,
    approval_url: approveLink.href
  });
});

exports.capture_paypal_payment = asyncHandler(async (req, res, next) => {
  const { order_id, paypal_order_id } = req.body;
  const order = await Order.findById(order_id);
  if (!order) {
    return next(new api_error('Order not found', 404));
  }
  const capture = await capture_paypal_order(paypal_order_id);
  if (capture.status !== 'COMPLETED') {
    return next(new api_error('Payment not completed', 400));
  }
  order.payment_status = 'paid';
  order.payment_method = 'paypal';
  await order.save();
  res.status(200).json({
    success: true,
    message: 'PayPal payment successful'
  });
});

exports.return_from_paypal = asyncHandler(async (req, res, next) => {
    const { token, PayerID, order_id } = req.query;
    const paypalOrderId = token;
    const orderId = order_id;

    console.log('Return from PayPal:', { token, PayerID, order_id, paypalOrderId, orderId });

    if (!paypalOrderId || !orderId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing PayPal token or order_id',
            received: { token, PayerID, order_id }
        });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new api_error('Order not found', 404));
    }
    try {
        const capture = await capture_paypal_order(paypalOrderId);
        console.log('Capture response:', capture);
        
        if (!capture || capture.status !== 'COMPLETED') {
            return next(new api_error('Payment not completed', 400));
        }
        order.payment_status = 'paid';
        order.payment_method = 'paypal';
        order.paypal_order_id = paypalOrderId;
        order.pay_at = Date.now();
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment captured and order updated',
            order_id: order._id
        });
    } catch (error) {
        console.error('Capture error:', error.message);
        return res.status(400).json({
            success: false,
            message: 'Failed to capture payment',
            error: error.message,
            debug: error.body || error
        });
    }
});

exports.cancel_payment = asyncHandler(async (req, res, next) => {
    const { order_id } = req.body;
    const order = await Order.findById(order_id);
    if (!order) {
       return next(new api_error('Order not found', 404));
    }
    if (order.payment_status === 'paid') {
       return next(new api_error('Cannot cancel paid order', 400));
    }
    order.payment_status = 'refunded';
    order.paypal_order_id = null;
    await order.save();
    res.status(200).json({
        success: true,
        message: 'Payment cancelled',
        data: {
            order_id: order._id,
            payment_status: order.payment_status
        }
    });
});

exports.paypal_webhook = asyncHandler(async (req, res, next) => {
  const body = req.body;
  const event_type = body.event_type;
  if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const resource = body.resource;
    let order_id = null;
    if (resource.custom_id) {
      order_id = resource.custom_id;
    }
    else if (resource.supplementary_data?.related_ids?.order_id) {
        const paypal_order_id = resource.supplementary_data.related_ids.order_id;
          const order = await Order.findOne({ paypal_order_id: paypal_order_id });
          if (order) {
             order_id = order._id.toString();
          } }

    else if (body.resource.invoice_id) {
      order_id = body.resource.invoice_id;
      }
    if (!order_id) {
        return res.status(200).json({ 
          received: true, message: 'No order_id found' 
            });}
  const order = await Order.findById(order_id);
  if (!order) {
        return res.status(200).json({ 
        received: true, 
        message: 'Order not found' 
        });
  }
        
    if (order.payment_status === 'paid') {
        return res.status(200).json({ 
        received: true, message: 'Already paid' 
         });
    }
    order.payment_status = 'paid';
    order.payment_method = 'paypal';
    order.paypal_capture_id = resource.id;
    order.pay_at = new Date();
    await order.save();
  }
  res.status(200).json({ 
    received: true,
    event_type: event_type
  });
});
