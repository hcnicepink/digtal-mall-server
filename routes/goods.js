let express = require('express')
let router = express.Router()
let Goods = require('../models/goods')

router.get('/hot', (req, res, next) => {
  Goods.find({saleNum: {$gte: 9}}, (err, doc) => {
    if (err) {
      res.json({
        "status": "1",
        "msg": err,
        "result": null
      })
    } else {
      res.json({
        "status": "0",
        "msg": "Success",
        "result": doc
      })
    }
  })
})

module.exports = router