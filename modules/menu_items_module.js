const mongoose = require('mongoose');
const{sanitize_text}= require('../utils/sanitize');
const menu_item_schema = new mongoose.Schema({
  name: {
    type: String,
   required: true,
    trim: true,
    set: sanitize_text
    },
    description: {type: String, set: sanitize_text},
    price: {
      type: Number,
      required: true,
        min: [0, 'Price must be a positive number']
    },
    category: {
      type: String,
        required: true,
        set: sanitize_text
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    availability: {
      type: Boolean,
        default: true
    },
    image:{
      type: String,
      set: sanitize_text
    },
    cloudinary_id: String
},
{ timestamps: true }
);

module.exports = mongoose.model('MenuItem', menu_item_schema);