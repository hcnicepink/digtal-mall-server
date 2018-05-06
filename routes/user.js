let express = require('express')
let router = express.Router()
let User = require('../models/user')
let crypto = require('crypto')
let Buffer = require('buffer')
let salt = 'hellodigtalmall'

router.post('/login', (req, res, next) => {
  let params = {
    email: req.body.username,
    pwd: req.body.username
  }

  // 加密密码
  let [hash1, hash2] = [crypto.createHash('sha512'), crypto.createHash('sha512')]
  params.pwd = hash2.update((hash1.update(params.pwd).digest('hex') + salt)).digest('hex')

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
        /**
         * 签发 token
         * 分为 header、payload、signature 三部分
         * header: typ(token类型)、alg(使用算法)
         * payload: iss(发行者)、exp(过期时间)、id(用户id)
         * signature: base64编码 (header + '.' + payload)， 然后加盐加密
         * 参考：https://ninghao.net/blog/2834
         */
        let header = JSON.stringify({
          alg: 'SHA512',
          typ: 'JWT'
        })
        let payload = JSON.stringify({
          iss: 'hcnicepink@163.com',
          exp: (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
          id: doc.id
        })
        let sha512 = crypto.createHash('sha512')
        let signature = sha512
          .update(Buffer.Buffer.from(header, 'ascii').toString('base64') + '.' + Buffer.Buffer.from(payload, 'ascii').toString('base64') + salt).digest('base64')
        
        res.cookie('digtalmall-token', signature, {maxAge: 60 * 60 * 24 * 365})

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