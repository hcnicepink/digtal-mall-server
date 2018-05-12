let Buffer = require('buffer')
let crypto = require('crypto')
const salt = 'hellodigtalmall'
let checkToken = (cookie) => {
  if (typeof cookie === 'undefined') return false
  let arr = cookie.split('.')
  let header = Buffer.Buffer.from(arr[0], 'hex').toString('ascii')
  let payload = Buffer.Buffer.from(arr[1], 'hex').toString('ascii')
  let alg = JSON.parse(header).alg
  let email = JSON.parse(payload).email
  let sha512 = crypto.createHash(alg)
  let signature = sha512
    .update(arr[0] + '.' + arr[1] + salt).digest('hex')
  if (arr[2] === signature) {
    return email
  } else {
    return false
  }
}
module.exports = checkToken
