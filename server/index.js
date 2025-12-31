require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); 
const app = require("./app");

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  transports: ['websocket', 'polling']
})

// Import SocketHandler
const SocketHandler = require('./utils/socket/handler')

// Initialize Socket Handler
const socketHandler = new SocketHandler(io)

// Store io instance globally
const socketUtil = require('./utils/socket/index')
socketUtil.setIo(io)

console.log('[Socket.IO] Initialized')

// Middleware để validate JWT token từ socket connection
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      // Vẫn cho connect nhưng không có user info
      return next()
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    socket.userId = decoded.id
    socket.userRole = decoded.role || 'USER'
    socket.userName = decoded.name

    next()
  } catch (err) {
    console.log('[Socket] Auth middleware error:', err.message)
    // Vẫn cho connect, nhưng không authenticate
    next()
  }
})

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  if (socket.userId) {
    console.log(`[Socket] Authenticated user: ${socket.userId}`)
  }

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })

  // Handle errors
  socket.on('error', (err) => {
    console.error(`[Socket] Error: ${err}`)
  })
})

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`
  HTTP/WS: http://localhost:${PORT}              
  Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}     
  Env: ${process.env.NODE_ENV || 'development'}
  `)
})

module.exports = { httpServer, io, socketHandler }
