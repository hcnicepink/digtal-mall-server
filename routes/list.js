let express = require('express')
let router = express.Router()
let Goods = require('../models/goods')
let mongoose = require('mongoose')


router.get('/', (req, res, next) => {
  if (typeof req.query.categoryid !== 'undefined') {
    Goods.find({'category._id': req.query.categoryid}, (err, doc) => {
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
  }
})

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