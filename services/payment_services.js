const Order = require('../modules/order_modules');
const mongoose = require('mongoose');
const api_error = require('../utils/api_error');
const asyncHandler = require('express-async-handler');
const api_features = require('../utils/api_features');

exports.create_payment= asyncHandler(async (req, res, next) => {
    const { order_id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(order_id)) {
        return next(new api_error('Invalid order ID', 400));
    }
    const order = await Order.findById(order_id);
    if (!order) {
        return next(new api_error('Order not found', 404));
    }
    if(order.customer.toString() !== req.user._id.toString()){
        return next(new api_error('Not authorized',403));
    }
    if (order.status !== 'pending') {
        return next(new api_error('Payment can only be made for pending orders', 400));
    }
    const payment_intent = {
        id: `pi_${new mongoose.Types.ObjectId()}`,
        amount: order.totalPrice,
        currency: 'usd',
        status: 'succeeded',
        created: Date.now(),
        order_id: order._id
    };
    res.status(200).json({
        success: true,
        payment_intent
    });
});

exports.confirm_payment= asyncHandler(async (req, res, next) => {
    const{payment_method,order_id}=req.body;
    if (!mongoose.Types.ObjectId.isValid(order_id)) {
        return next(new api_error('Invalid order ID', 400));
    }
    const order = await Order.findById(order_id);
    if (!order) {
        return next(new api_error('Order not found', 404));
    }
    const is_success=true;
    if (is_success) {
        order.payment_status= 'paid';
        await order.save();
        res.status(200).json({
            success: true,
            message: 'Payment confirmed and order updated',
            order
        });
    } else {
        return next(new api_error('Payment failed', 402));
    }
});

exports.request_refund= asyncHandler(async (req, res, next) => {
    const { order_id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(order_id)) {
        return next(new api_error('Invalid order ID', 400));
    }
    const order = await Order.findById(order_id);
    if (!order) {
        return next(new api_error('Order not found', 404));
    }
    if(order.payment_status !== 'paid'){
        return next(new api_error('Order not paid',400));
    }
    order.payment_status = 'refunded';
    order.status = 'cancelled';
    await order.save();
    res.status(200).json({
        success: true,
        message: 'Refund requested',
        order
    });
});
  
