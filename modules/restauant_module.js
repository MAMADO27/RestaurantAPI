const mongoose= require('mongoose');
const{sanitize_text,sanitize_rich_text}= require('../utils/sanitize');
const restaurant_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: sanitize_text
    },
    address: {
      type: String,
      required: true,
      set: sanitize_text
    },
    description: {
      type: String,
      set: sanitize_rich_text,
    },
    phone: {type:String, set: sanitize_text},
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        //required: true
    },
    cuisine: {
      type:String,
      required: true,
      set: sanitize_text

      }
},
{ timestamps: true }
);
module.exports = mongoose.model('Restaurant', restaurant_schema);