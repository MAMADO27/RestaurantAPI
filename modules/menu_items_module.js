const mongoose = require('mongoose');
const menu_item_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
        min: [0, 'Price must be a positive number']
    },
    category: {
      type: String,
        required: true
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
    image_url: String
},
{ timestamps: true }
);
module.exports = mongoose.model('MenuItem', menu_item_schema);