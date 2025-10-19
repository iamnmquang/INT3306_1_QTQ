require('dotenv').config()

const PORT = process.env.PORT
const SQL_CONFIG = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}

module.exports = {PORT, SQL_CONFIG}