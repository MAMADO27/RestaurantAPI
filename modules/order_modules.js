const mongoose = require('mongoose');
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
        required: true
    },
    notes:String,
    deliver_fee:{
        type: Number,
        required: true
    },
    tax:{
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', order_schema);

