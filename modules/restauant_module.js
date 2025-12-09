const mongoose= require('mongoose');
const restaurant_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: String,
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cuisine: {
       type:String,
       required: true

      }
},
{ timestamps: true }
);
module.exports = mongoose.model('Restaurant', restaurant_schema);