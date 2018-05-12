let express = require('express')
let router = express.Router()
let Carousel = require('../models/carousel')


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

module.exports = router
