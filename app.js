let createError = require('http-errors')
let express = require('express')
let path = require('path')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
let mongoose = require('mongoose')
let checkToken = require('./util/checkToken')

let indexRouter = require('./routes/index')
let userRouter = require('./routes/user')
let goodsRouter = require('./routes/goods')

let app = express()

// 连接数据库
mongoose.connect('mongodb://root:123456@127.0.0.1:27017/digtalMall')

mongoose.connection.on('connected', () => {
  console.log('MongoDB Connected!')
})
mongoose.connection.on('error', () => {
  console.log('MongoDB fail!')
})
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Disconnected!')
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  if(checkToken(req.cookies.digtaltoken) === false) {
    if (req.path.indexOf('/user') !== -1 || req.path === '/carousel'|| req.path === '/category' || req.path.indexOf('/goods') !== -1) {
      next()
    } else {
      res.json({
        code: 10001,
        msg: '您尚未登录',
        result: null
      })
    }
  } else {
    next()
  }
})

app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/goods', goodsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
