const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  physical_address1: {
    type: String
  },
  physical_address2: {
    type: String
  },
  physical_address3: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  credit:{
    type: Number,
    default: 0
  },
  p_name:{
    type:String
  },
  bank_acc: [ {acc_num: {
    type: Number,
    required: true
  },
  routing_num: {
    type: Number,
    required: true
  }}], 
  schedule: [ {schedule_time: {
    type: String,
    required: true
  }, 
  stock_name: {
    type: String
  },
  stock_qty: {
    type: Number
  },
  purchase_price: {
    type: Number
  }}],

  stock: [ { ticker_symbol: {
    type: String,
    required: true
  },
  stock_name: {
    type: String,
    required: true
  },
  stock_qty: {
    type: Number,
    required: true
  },
  purchase_price: {
    type: Number,
    required: true
  },
  selling_price: {
    type: Number
  },
  purchase_date: {
    type: Date,
    required: true
  }}],
   date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;