let express = require('express')
let router = express.Router()
let User = require('../models/user')
let crypto = require('crypto')
let Buffer = require('buffer')
let Busboy = require('busboy')
let path = require('path')
let fs = require('fs')
let checkToken = require('../util/checkToken')
const salt = 'hellodigtalmall'
const alg = 'sha512'

// 登录
router.post('/login', (req, res, next) => {
  let params = {
    email: req.body.username,
    pwd: req.body.password
  }

  if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(params.email) && /\w{5,17}$/.test(params.pwd)) {
    // 加密密码
    let [hash1, hash2] = [crypto.createHash('sha512'), crypto.createHash('sha512')]
    params.pwd = hash2.update((hash1.update(params.pwd).digest('hex') + salt)).digest('hex')

    User.findOne(params, (err, doc) => {
      if (err) {
        res.json({
          code: 500,
          msg: err,
          result: null
        })
      } else {
        if (doc === null) {
          res.json({
            code: 201,
            msg: '用户名或密码错误',
            result: null
          })
        } else {
          /**
           * 签发 token
           * 分为 header、payload、signature 三部分
           * header: typ(token类型)、alg(使用算法)
           * payload: iss(发行者)、exp(过期时间)、email(用户email)
           * signature: base64编码 (header + '.' + payload)， 然后加盐加密
           * 参考：https://ninghao.net/blog/2834
           */
          let header = Buffer.Buffer.from(JSON.stringify({
            alg: alg,
            typ: 'JWT'
          }), 'ascii').toString('hex')
          let payload = Buffer.Buffer.from(JSON.stringify({
            iss: 'hcnicepink@163.com',
            exp: (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
            email: doc.email
          }), 'ascii').toString('hex')
          let sha512 = crypto.createHash(alg)
          let signature = sha512
            .update(header + '.' + payload + salt).digest('hex')

          res.cookie('digtaltoken', `${header}.${payload}.${signature}`, { maxAge: 60 * 60 * 24 * 365 * 1000 })

          res.json({
            code: 200,
            msg: '登录成功',
            result: {
              email: doc.email
            }
          })
        }
      }
    })
  } else {
    res.json({
      code: 201,
      msg: '用户名或密码错误',
      result: null
    })
  }

})

// 注册
router.post('/register', (req, res, next) => {
  let params = {
    email: req.body.username,
    pwd: req.body.password,
    phone: '',
    avatar: '',
    nickname: '',
    gender: 0,
    orderList: [],
    cartList: [],
    addressList: []
  }

  if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(params.email) && /\w{5,17}$/.test(params.pwd)) {
    User.findOne({ email: params.email }, (err, doc) => {
      if (doc) {
        res.json({
          code: 201,
          msg: '用户名已存在',
          result: null
        })
      } else {
        // 加密密码
        let [hash1, hash2] = [crypto.createHash('sha512'), crypto.createHash('sha512')]
        params.pwd = hash2.update((hash1.update(params.pwd).digest('hex') + salt)).digest('hex')

        User.create(params, err => {
          if (err) {
            res.json({
              code: 500,
              msg: err,
              result: null
            })
          } else {
            res.json({
              code: 200,
              msg: '注册成功',
              result: null
            })
          }
        })
      }
    })
  } else {
    res.json({
      code: 202,
      msg: '请输入符合要求的用户名和密码',
      result: null
    })
  }
})

// 登出
router.get('/logout', (req, res, next) => {
  res.clearCookie('digtaltoken')
  res.json({
    code: 200,
    msg: '退出成功',
    result: null
  })
})

// 登录检查
router.get('/checkLogin', (req, res, next) => {
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '未登录',
      result: null
    })
  } else {
    User.findOne({'email': checkResult}, (err, doc) => {
      if (err) {
        res.json({
          code: 500,
          msg: err,
          result: null
        })
      } else {
        res.json({
          code: 200,
          msg: '登录中',
          result: {
            userEmail: checkResult,
            userInfo: {
              email: doc.email,
              phone: doc.phone,
              avatar: doc.avatar,
              nickname: doc.nickname,
              gender: doc.gender,
            }
          }
        })
      }
    })
  }
})

// 头像上传
router.post('/uploadAvatar', (req, res, next) => {
  let busboy = new Busboy({ headers: req.headers })
  let checkResult = checkToken(req.cookies.digtaltoken)
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype)

    let saveTo = path.join(__dirname, '../public/images/avatar',path.basename(fieldname))
    file.pipe(fs.createWriteStream(saveTo))
    User.updateOne({'email': checkResult}, {'avatar': `http://localhost:3000/images/avatar/${fieldname}`}, (err, raw) => {})

    file.on('data', function(data) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes')
    })
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
    })
  })
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val))
  })
  busboy.on('finish', function() {
    console.log('Done parsing form!')
    User.findOne({'email': checkResult}, (err, doc) => {
      if (err) {
        res.json({
          code: 500,
          msg: err,
          result: null
        })
      } else {
        res.json({
          code: 200,
          msg: 'success',
          result: doc.avatar
        })
      }
    })
  });
  req.pipe(busboy)
})

module.exports = router