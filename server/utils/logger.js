const info = (...params) => {
    console.error(...params)
  
}

const error = (...params) => {
    console.error(...params)
}

module.exports = { info, error }