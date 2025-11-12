const crypto = require('crypto');
const bcrypt = require('bcrypt')


//hash token before saving it to the db
const hashToken = (token) => {
  return crypto.createHash('sha512').update(token).digest('hex');
}

const hashOTP = (otp) => {
 return bcrypt.hashSync(otp,12);
}

module.exports = { hashToken, hashOTP };