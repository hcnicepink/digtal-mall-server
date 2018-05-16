let mongoose = require('mongoose')

let goodsSchema = new mongoose.Schema({
  "category": {
    "_id": mongoose.Schema.Types.ObjectId,
    'name': String
  },
  "title": String,
  "subtitle": String,
  "price": Number,
  "promise": String,
  "spec": String,
  "name": String,
  "param": [
    {
      "name": String,
      "detail": String
    }
  ],
  "details_img": Array,
  "shelf_time": Number,
  "sold_count": Number,
  "stock": Number,
  "is_onsale": Boolean,
  "pic": [
    {
      "sm": String,
      "md": String,
      "lg": String
    }
  ],
  "discount": Number,
  "brand": String
})

module.exports = mongoose.model('goods', goodsSchema, 'goods')
