let mongoose = require('mongoose')

let goodsSchema = mongoose.Schema({
  "name": String,
  "stock": Number,
  "image": String,
  "price": Number,
  "saleNum": Number,
  "checked": Boolean
})

module.exports = mongoose.model('good', goodsSchema)