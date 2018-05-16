let mongoose = require('mongoose')

let carouselSchema = new mongoose.Schema({
  "img": String,
  "title": String,
  "href": String
})

module.exports = mongoose.model('carousel', carouselSchema, 'carousel')