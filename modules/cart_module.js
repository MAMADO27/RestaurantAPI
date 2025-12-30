 const mongoose = require('mongoose');
const cart_schema = new mongoose.Schema({
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
 cart: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {   
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {      
            type: Number,
            required: true
        }
    }]
},
{ timestamps: true, strictPopulate: false }
);
module.exports = mongoose.model('Cart', cart_schema);