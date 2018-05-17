let express = require('express')
let router = express.Router()
let Carousel = require('../models/carousel')
let Category = require('../models/category')
let Brand = require('../models/brand')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'express' })
})

router.get('/carousel', (req, res, next) => {
  Carousel.find((err, doc) => {
    if (err) {
      res.json({
        code: 500,
        msg: err,
        result: null
      })
    } else {
      res.json({
        code: 200,
        msg: '成功',
        result: doc
      })
    }
  })
})

router.get('/category', (req, res, next) => {
  Category.find((err, doc) => {
    if (err) {
      res.json({
        code: 500,
        msg: err,
        result: null
      })
    } else {
      res.json({
        code: 200,
        msg: '成功',
        result: doc
      })
    }
  })
})

router.get('/brand', (req, res, next) => {
  Brand.find((err, doc) => {
    if (err) {
      res.json({
        code: 500,
        msg: err,
        result: null
      })
    } else {
      res.json({
        code: 200,
        msg: '成功',
        result: doc
      })
    }
  })
})

module.exports = router
