const jwt = require('jsonwebtoken')
const crypto = require('crypto')

//Access token for short request
const generateAccessToken = (user) => {
  return jwt.sign({
    userId: user.id,
    role: user.role,
  }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

//Generate random string for refresh token
const generateRefreshToken = () => {
  const token = crypto.randomBytes(16).toString('base64url');
  return token;
}

const generateTokens = (user) => {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken()

  return { accessToken, refreshToken }
}

const generateOTP = () => {
  return String(crypto.randomInt(100000, 999999));

}

const generateBookingReference = () => {
  return crypto.randomBytes(6).toString('base64url')
}

const generateTicketNumber = (flightNumber) => {
  const randomDigits = crypto.randomInt(10000000, 99999999)
  const ticketNumber = `${flightNumber}-${randomDigits}`;
  return ticketNumber
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  generateOTP,
  generateBookingReference,
  generateTicketNumber
};



