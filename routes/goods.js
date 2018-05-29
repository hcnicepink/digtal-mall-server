let express = require('express')
let router = express.Router()
let Goods = require('../models/goods')
let mongoose = require('mongoose')


router.get('/', (req, res, next) => {
  let query = {}
  let page = 1
  let pageSize = 8
  let skip = (page - 1) * pageSize
  let sort = {}
  if (typeof req.query.categoryid !== 'undefined') {
    query['category._id'] = req.query.categoryid
  }
  if (typeof req.query.brandid !== 'undefined') {
    query['brand._id'] = req.query.brandid
  }
  if (typeof req.query.haveStock !== 'undefined') {
    query['stock'] = {$gt: 0}
  }
  if (typeof req.query.page !== 'undefined') {
    page = parseInt(req.query.page)
  }
  if (typeof req.query.pageSize !== 'undefined') {
    page = parseInt(req.query.pageSize)
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
  if (typeof req.query.sortType !== 'undefined' && typeof req.query.sortFlag !=='undefined') {
    sort[req.query.sortType] = req.query.sortFlag 
  }
  Goods.find(query).skip(skip).limit(pageSize).sort(sort).exec((err, doc) => {
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

router.get('/detail', (req, res, next) => {
  Goods.findById(req.query.id, (err, doc) => {
    if (err) {
      res.json({
        code: 500,
        msg: err,
        result: null
      })
    } else {
      Goods.find({name: doc.name}, (err, doc1) => {
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
            result: {
              detail: doc,
              spec: doc1
            }
          })
        }
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