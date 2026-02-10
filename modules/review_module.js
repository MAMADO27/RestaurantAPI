const mongoose = require('mongoose');
const{sanitize_text}= require('../utils/sanitize');
const review_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: true,
        set: sanitize_text
    }
}, { timestamps: true });
module.exports = mongoose.model('Review', review_schema);