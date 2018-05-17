let express = require('express')
let router = express.Router()
let Goods = require('../models/goods')
let mongoose = require('mongoose')


router.get('/', (req, res, next) => {
  let query = {}
  let page = 0
  if (typeof req.query.categoryid !== 'undefined') {
    query['category._id'] = req.query.categoryid
  }
  if (typeof req.query.brandid !== 'undefined') {
    query['brand._id'] = req.query.brandid
  }
  if (typeof req.query.page !== 'undefined') {
    page = parseInt(req.query.page)
  }
  if (typeof req.query.priceRange !== 'undefined') {
    switch (parseInt(req.query.priceRange)) {
      case 0: query.price = {$gte: 0, $lte: 499}
      break
      case 1: query.price = {$gte: 500, $lte: 999}
      break
      case 2: query.price = {$gte: 1000, $lte: 1999}
      break
      case 3: query.price = {$gte: 2000, $lte: 4999}
      break
      case 4: query.price = {$gte: 5000}
      break
    }
  }
  if (typeof req.query.keyword !== 'undefined') {
    query.title = {$regex: req.query.keyword}
  }
  console.log(query)
  Goods.find(query, (err, doc) => {
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

module.exports = router