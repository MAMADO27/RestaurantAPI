const mongoose = require('mongoose');
const{sanitize_text}= require('../utils/sanitize');
const order_schema = new mongoose.Schema({
    items: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {  
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['card', 'cash_on_delivery', 'paypal'],
        required: true
    },
    pay_at: Date,
    paypal_order_id: String,
    paypal_capture_id: String,
    status: {
        type: String,
        enum: ['pending', 'preparing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    deliveryAddress: {  
        type: String,
        required: true,
        set: sanitize_text
    },
    notes:{type: String, set: sanitize_text},
    deliver_fee:{
        type: Number,
        required: true
    },
    discount:{
        type: Number,
        default: 0
    },
    copon_code:{
        type: String,
        set: sanitize_text,
        uppercase: true 
    },
    tax:{
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', order_schema);

