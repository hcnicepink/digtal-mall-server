let mongoose = require('mongoose')

let brandSchema = new mongoose.Schema({
  "_id": mongoose.Schema.Types.ObjectId,
  "name": String
})

module.exports = mongoose.model('brand', brandSchema, 'brand')