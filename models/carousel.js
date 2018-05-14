let mongoose = require('mongoose')

let carouselSchema = mongoose.Schema({
  "img": String,
  "title": String,
  "href": String
})

module.exports = mongoose.model('carousel', carouselSchema, 'carousel')