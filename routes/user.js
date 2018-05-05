let express = require('express')
let router = express.Router()
let User = require('../models/user')
let crypto = require('crypto')

router.post('/login', (req, res, next) => {
  let params = {
    email: req.body.username,
    pwd: req.body.username
  }

  // 加密
  let [hash1, hash2] = [crypto.createHash('sha512'), crypto.createHash('sha512')]
  params.pwd = hash2.update((hash1.update(params.pwd).digest('hex') + 'hellodigtalmall')).digest('hex')

  User.findOne(params, (err, doc) => {
    if (err) {
      res.json({
        "status": "1",
        "msg": err,
        "result": null
      })
    } else {
      if (doc === null) {
        res.json({
          "status": "1",
          "msg": "用户名或密码错误",
          "result": null
        })
      } else {
        res.json({
          "status": "0",
          "msg": "Login Success",
          "result": null
        })
      }
    }
  })
})

module.exports = router