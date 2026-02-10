const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {sanitize_text}= require('../utils/sanitize');
const user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: sanitize_text
    },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
   type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  password: {
    type: String,
    required: true,
   minlength: [6, 'Password must be at least 6 characters long'],
   required: function () {
    return this.provider === 'local';
  },
   },
  role:{
    type: String,
    enum: ['customer', 'staff', 'admin'],
    default: 'customer'

   },
  phone: String,
  address: {type:String, set: sanitize_text,trim: true},

  password_reset_code: String,
  password_reset_expires: Date,
  password_reset_verified: {
    type: Boolean,
    default: false
  }

 
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