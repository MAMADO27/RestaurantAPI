const mongoose = require('mongoose');
const{sanitize_text}= require('../utils/sanitize');
const copon_schema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        set: sanitize_text
    },
    discount_value: {
        type: Number,
        required: true,
        min: [0, 'Discount value must be a positive number']
    },
    expiration_date: {
        type: Date,
        required: true
    },
    usage_limit: {
        type: Number,
        default: null,
        min: [1, 'Usage limit must be at least 1']
    },
    times_used: {
        type: Number,
        default: 0,
        min: [0, 'Times used cannot be negative']
    },
    active: {
        type: Boolean,
        default: true
    },
    used_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true }
);
module.exports = mongoose.model('Copon', copon_schema);