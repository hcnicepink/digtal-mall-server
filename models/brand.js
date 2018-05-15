let mongoose = require('mongoose')

let brandSchema = new mongoose.Schema({
  name: String
})

module.exports = mongoose.Model('brand', brandSchema, 'brand')