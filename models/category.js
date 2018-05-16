let mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
  "_id": mongoose.Schema.Types.ObjectId,
  "name": String
})

module.exports = mongoose.model('category', categorySchema, 'category')