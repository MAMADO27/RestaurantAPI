const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
    },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    },
  password: {
    type: String,
    required: true,
   minlength: [6, 'Password must be at least 6 characters long']
   },
  role:{
    type: String,
    enum: ['customer', 'staff', 'admin'],
    default: 'customer'

   },
  phone: String,
  address: String,

 
},
{ timestamps: true }
);
user_schema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});
user_schema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', user_schema);