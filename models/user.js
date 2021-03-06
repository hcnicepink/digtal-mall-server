let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
  "email": String,
  "pwd": String,
  "phone": String,
  "avatar": String,
  "nickname": String,
  "gender": Number,
  "addressList": [
    {
      "_id": mongoose.Schema.Types.ObjectId,
      "receiver": String,
      "province": String,
      "city": String,
      "county": String,
      "address": String,
      "cellphone": String,
      "postcode": String,
      "tag": String,
      "is_default": Boolean
    }
  ],
  "orderList": [
    {
      "order_id": String,
      "address": {
        "receiver": String,
        "province": String,
        "city": String,
        "county": String,
        "address": String,
        "address": String,
        "cellphone": String,
        "postcode": String,
        "tag": String,
        "is_default": Boolean
      },
      "status": Number,
      "order_time": Number,
      "pay_time": Number,
      "deliver_time": Number,
      "received_time": Number,
      "detailList": [
        {
          "goods": {
            "_id": mongoose.Schema.Types.ObjectId,
            "title": String,
            "price": Number,
            "spec": String,
            "pic": {
              "sm": String,
              "md": String,
              "lg": String
            },
            "href": String
          },
          "count": Number
        }
      ]
    }
  ],
  "cartList": [
    {
      "goods": {
        "_id": mongoose.Schema.Types.ObjectId,
        "name": String,
        "price": Number,
        "spec": String,
        "pic": [
          {
            "sm": String,
            "md": String,
            "lg": String
          }
        ],
        "href": String
      },
      "count": Number,
      "is_check": Boolean
    }
  ]
})

module.exports = mongoose.model('user', userSchema, 'user')