let express = require('express')
let router = express.Router()
let Goods = require('../models/goods')

router.get('/hot', (req, res, next) => {
  Goods.find({sold_count: {$gte: 9}}, (err, doc) => {
    if (err) {
      res.json({
        code: 500,
        msg: err,
        result: null
      })
    } else {
      res.json({
        code: 200,
        msg: "Success",
        result: doc
      })
    }
  })
})

router.get('/all', (req, res, next) => {
  Goods.find((err, doc) => {
    if (err) {
      res.json({
        code: 500,
        msg: err,
        result: null
      })
    } else {
      res.json({
        code: 200,
        msg: "Success",
        result: doc
      })
    }
  })
})

module.exports = router