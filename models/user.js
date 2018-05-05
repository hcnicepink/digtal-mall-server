let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
  "email": String,
  "pwd": String,
  "orderList": Array,
  "cartList": Array,
  "addressList": Array
})

module.exports = mongoose.model('user', userSchema)