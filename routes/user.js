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

  if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(params.email) && /\w{6,18}$/.test(params.pwd)) {
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
            },
            cartList: doc.cartList,
            addressList: doc.addressList
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

// 更新个人信息
router.post('/updateUserInfo', (req, res, next) => {
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '更新失败',
      result: null
    })
    next()
  }
  let params = req.body
  if (/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(params.phone)
  && /^[\u4E00-\u9FA5A-Za-z0-9_]{1,10}$/.test(params.nickname)
  && (parseInt(params.gender) === 0 || 1 || 2)
  && params.oldPassword === ''
  && params.newPassword === '') {
    User.updateOne({'email': checkResult}, {'phone': params.phone, 'nickname': params.nickname, 'gender': parseInt(params.gender)}, (err, raw) => {
      if (err) {
        res.json({
          code: 500,
          msg: '服务器错误',
          result: null
        })
      } else {
        res.json({
          code: 200,
          msg: '更新成功',
          result: null
        })
      }
    })
  } else if (/\w{6,18}$/.test(params.oldPassword)
  && /\w{6,18}$/.test(params.newPassword)) {
    // 更新密码
    let [hash1, hash2] = [crypto.createHash('sha512'), crypto.createHash('sha512')]
    params.oldPassword = hash2.update((hash1.update(params.oldPassword).digest('hex') + salt)).digest('hex')
    
    let [hash3, hash4] = [crypto.createHash('sha512'), crypto.createHash('sha512')]
    params.newPassword = hash4.update((hash3.update(params.newPassword).digest('hex') + salt)).digest('hex')

    User.findOne({'email': checkResult}, (err, doc) => {
      if (params.oldPassword === doc.pwd) {
        doc.pwd = params.newPassword
        doc.save((err, doc) => {
          if (err) {
            res.json({
              code: 500,
              msg: '服务器错误',
              result: null
            })
          } else {
            res.json({
              code: 200,
              msg: '更新成功',
              result: null
            })
          }
        })
      } else {
        res.json({
          code: 201,
          msg: '更新失败，旧密码错误！',
          result: null
        })
      }
    })
  } else {
    res.json({
      code: 201,
      msg: '更新失败，请检查格式后重试！',
      result: null
    })
  }
})

// 新增地址信息
router.post('/addAddress', (req, res, next) => {
  let checkResult = checkToken(req.cookies.digtaltoken)
  let params = req.body
  if (checkResult === false
    || params.name === ''
    || params.phone === ''
    || params.province === ''
    || params.city === ''
    || params.county === ''
    || params.detailAddress === ''
    || params.isDefault === ''
    || !/[\u4E00-\u9FA5A-Za-z0-9_]{1,15}$/.test(params.name)
    || !/[\u4E00-\u9FA5A-Za-z0-9_]{4,15}$/.test(params.detailAddress)
    || !/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(params.phone)) {
    res.json({
      code: 201,
      msg: '更新失败',
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
        if (params.isDefault === true) {
          for (let i = 0; i < doc.addressList.length; i++) {
            doc.addressList[i].is_default = false
          }
        }
        doc.addressList.push({
          receiver: params.name,
          cellphone: params.phone,
          province: params.province,
          city: params.city,
          county: params.county,
          address: params.detailAddress,
          is_default: params.isDefault
        })
        doc.save((err, doc) => {
          if (err) {
            res.json({
              code: 500,
              msg: err,
              result: null
            })
          } else {
            res.json({
              code: 200,
              msg: '添加成功',
              result: doc.addressList
            })
          }
        })
      }
    })
  }
})

// 获取地址信息
router.get('/getAddress', (req, res, next) => {
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '获取地址失败',
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
          msg: '获取地址成功',
          result: doc.addressList
        })
      }
    })
  }
})

// 删除地址信息
router.post('/deleteAddress', (req, res, next) => {
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '获取地址失败',
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
        doc.addressList.splice(req.body.index, 1)
        doc.save((err, doc) => {
          if (err) {
            res.json({
              code: 500,
              msg: err,
              result: null
            })
          } else {
            res.json({
              code: 200,
              msg: '删除成功',
              result: doc.addressList
            })
          }
        })
      }
    })
  }
})

// 设置默认地址
router.post('/setAddressDefault', (req, res, next) => {
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '获取地址失败',
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
        for (let i = 0; i < doc.addressList.length; i++) {
          doc.addressList[i].is_default = false
        }
        doc.addressList[req.body.index].is_default = true
        doc.save((err, doc) => {
          if (err) {
            res.json({
              code: 500,
              msg: err,
              result: null
            })
          } else {
            res.json({
              code: 200,
              msg: '设置成功',
              result: doc.addressList
            })
          }
        })
      }
    })
  }
})


// 添加购物车
router.post('/addCart', (req, res, next) => {
  let params = req.body
  let checkResult = checkToken(req.cookies.digtaltoken)
  let flag = true
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '加入失败',
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
        for (let i = 0; i < doc.cartList.length; i++) {
          if (doc.cartList[i].goods._id.toString() === params.goods._id) {
            flag = false
            doc.cartList[i].count += params.count
            doc.save((err, doc) => {
              if (err) {
                res.json({
                  code: 500,
                  msg: err,
                  result: null
                })
              } else {
                res.json({
                  code: 200,
                  msg: '添加成功',
                  result: doc.cartList
                })
              }
            })
            break
          }
        }
        if (flag === true) {
          doc.cartList.push(params)
          doc.save((err, doc) => {
            if (err) {
              res.json({
                code: 500,
                msg: err,
                result: null
              })
            } else {
              res.json({
                code: 200,
                msg: '添加成功',
                result: doc.cartList
              })
            }
          })
        }
      }
    })
  }
})

// 更新购物车
router.post('/updateCart', (req, res, next) => {
  let params = req.body
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '更新失败',
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
        doc.cartList = params
        doc.save((err, doc) => {
          if (err) {
            res.json({
              code: 500,
              msg: err,
              result: null
            })
          } else {
            res.json({
              code: 200,
              msg: '更新成功',
              result: doc.cartList
            })
          }
        })
      }
    })
  }
})

// 创建订单
router.post('/orderConfirm', (req, res, next) => {
  let params = req.body
  let checkResult = checkToken(req.cookies.digtaltoken)
  if (checkResult === false) {
    res.json({
      code: 201,
      msg: '更新失败',
      result: null
    })
  } else {
    User.findOne({'email': checkResult}, (err, doc) => {
      let order = {
        order_id: Date.now() + '' + Math.floor(Math.random() * 8999 + 1000),
        status: 0,
        order_time: Date.now(),
        pay_time: Date.now(),
        address: params.address,
        detailList: []
      }
      let total = 0
      doc.cartList.forEach(elem => {
        if (elem.is_check === true) {
          total += elem.goods.price * elem.count
        }
      })
      doc.cartList.forEach((elem, index) => {
        // 向订单中push商品
        if (elem.is_check === true) {
          order.detailList.push({
            goods: {
              _id: elem.goods._id,
              name: elem.goods.name,
              price: elem.goods.price,
              spec: elem.goods.spec,
              pic: elem.goods.pic,
              href: elem.goods.href
            },
            count: elem.count
          })
        }
      })
      // 剔除购物车中选中的元素
      for (let i = 0; i < doc.cartList.length; i++) {
        if (doc.cartList[i].is_check === true) {
          doc.cartList.splice(i--, 1)
        }
      }
      doc.orderList.push(order)
      doc.save((err, doc) => {
        if (err) {
          res.json({
            code: 201,
            msg: err,
            result: null
          })
        } else {
          res.json({
            code: 200,
            msg: '下单成功',
            result: {
              id: order.order_id,
              total: total
            }
          })
        }
      })
    })
  }
})

module.exports = router