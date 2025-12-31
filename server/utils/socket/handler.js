const ChatService = require('../../api/chat/chat.service')


class SocketHandler {
  constructor(io) {
    this.io = io
    this.userSockets = new Map() // userId -> socketId
    this.init()
  }

  init() {
    this.io.on('connection', (socket) => {
      console.log(`[Socket] User connected: ${socket.id}`)

      // ============= EVENTS =============

      /**
       * User join event
       * Client emit: socket.emit('user:join', { userId, role })
       */
      socket.on('user:join', (data) => {
        try {
          const { userId, role } = data

          if (!userId || !role) {
            socket.emit('error', { message: 'Missing userId or role' })
            return
          }

          // Store socket mapping
          this.userSockets.set(userId, socket.id)
          socket.userId = userId
          socket.userRole = role

          // User join personal room
          socket.join(`user:${userId}`)

          // Admin join admin room
          if (role === 'ADMIN') {
            socket.join('admin:all')
          }

          console.log(`[Socket] ${role} ${userId} joined`)

          // Notify admin về user online
          if (role === 'USER') {
            this.io.to('admin:all').emit('user:status', {
              userId,
              status: 'online',
              timestamp: new Date().toISOString()
            })
          }

          socket.emit('user:join:success', {
            message: 'Successfully connected',
            userId,
            role
          })
        } catch (err) {
          console.error('[Socket] user:join error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * Join chat room event
       * Client emit: socket.emit('chat:join', { roomId })
       */
      socket.on('chat:join', (data) => {
        try {
          const { roomId } = data
          const userId = socket.userId

          if (!roomId) {
            socket.emit('error', { message: 'Missing roomId' })
            return
          }

          // Validate access
          ChatService.validateRoomAccess(userId, roomId, socket.userRole)
            .then(() => {
              socket.join(`room:${roomId}`)
              console.log(
                `[Socket] User ${userId} joined room ${roomId}`
              )

              // Notify others in room
              this.io.to(`room:${roomId}`).emit('user:joined:room', {
                userId,
                roomId,
                timestamp: new Date().toISOString()
              })
            })
            .catch((err) => {
              socket.emit('error', { message: err.message })
            })
        } catch (err) {
          console.error('[Socket] chat:join error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * Leave chat room event
       * Client emit: socket.emit('chat:leave', { roomId })
       */
      socket.on('chat:leave', (data) => {
        try {
          const { roomId } = data
          const userId = socket.userId

          socket.leave(`room:${roomId}`)
          console.log(`[Socket] User ${userId} left room ${roomId}`)

          this.io.to(`room:${roomId}`).emit('user:left:room', {
            userId,
            roomId,
            timestamp: new Date().toISOString()
          })
        } catch (err) {
          console.error('[Socket] chat:leave error:', err)
        }
      })

      /**
       * Typing indicator event
       * Client emit: socket.emit('chat:typing', { roomId, isTyping })
       */
      socket.on('chat:typing', (data) => {
        try {
          const { roomId, isTyping } = data
          const userId = socket.userId

          this.io.to(`room:${roomId}`).emit('user:typing', {
            userId,
            roomId,
            isTyping,
            timestamp: new Date().toISOString()
          })
        } catch (err) {
          console.error('[Socket] chat:typing error:', err)
        }
      })

      /**
       * Mark messages as read event
       * Client emit: socket.emit('chat:mark-read', { roomId })
       */
      socket.on('chat:mark-read', (data) => {
        try {
          const { roomId } = data
          const userId = socket.userId

          ChatService.markMessagesRead(roomId, userId)
            .then((result) => {
              console.log(
                `[Socket] Marked ${result.count} messages as read in room ${roomId}`
              )

              // Notify room about read status
              this.io.to(`room:${roomId}`).emit('messages:marked-read', {
                roomId,
                userId,
                timestamp: new Date().toISOString()
              })
            })
            .catch((err) => {
              socket.emit('error', { message: err.message })
            })
        } catch (err) {
          console.error('[Socket] chat:mark-read error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * New message event (realtime)
       * Emitted từ controller, nhưng dapat từ client để broadcast
       * Client emit: socket.emit('message:new', { roomId, message })
       */
      socket.on('message:new', (data) => {
        try {
          const { roomId, message } = data
          const userId = socket.userId

          if (!roomId || !message) {
            socket.emit('error', { message: 'Missing roomId or message' })
            return
          }

          // Validate message ownership
          if (message.senderId !== userId && socket.userRole !== 'ADMIN') {
            socket.emit('error', { message: 'Not message owner' })
            return
          }

          console.log(`[Socket] New message in room ${roomId}`)

          // Broadcast to room
          this.io.to(`room:${roomId}`).emit('message:new', {
            event: 'message:new',
            data: message,
            timestamp: new Date().toISOString()
          })

          // Notify admin sidebar about room update
          this.io.to('admin:all').emit('room:updated', {
            roomId,
            lastMessage: message,
            timestamp: new Date().toISOString()
          })

          socket.emit('message:sent:success', {
            messageId: message.id,
            roomId
          })
        } catch (err) {
          console.error('[Socket] message:new error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * Message deleted event
       * Client emit: socket.emit('message:delete', { roomId, messageId })
       */
      socket.on('message:delete', (data) => {
        try {
          const { roomId, messageId } = data

          if (!roomId || !messageId) {
            socket.emit('error', { message: 'Missing roomId or messageId' })
            return
          }

          console.log(
            `[Socket] Message ${messageId} deleted in room ${roomId}`
          )

          // Broadcast to room
          this.io.to(`room:${roomId}`).emit('message:deleted', {
            event: 'message:deleted',
            messageId,
            roomId,
            timestamp: new Date().toISOString()
          })
        } catch (err) {
          console.error('[Socket] message:delete error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * Message edited event
       * Client emit: socket.emit('message:edit', { roomId, message })
       */
      socket.on('message:edit', (data) => {
        try {
          const { roomId, message } = data

          if (!roomId || !message) {
            socket.emit('error', { message: 'Missing roomId or message' })
            return
          }

          console.log(
            `[Socket] Message ${message.id} edited in room ${roomId}`
          )

          // Broadcast to room
          this.io.to(`room:${roomId}`).emit('message:edited', {
            event: 'message:edited',
            data: message,
            timestamp: new Date().toISOString()
          })
        } catch (err) {
          console.error('[Socket] message:edit error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * Admin broadcast message event
       * Admin emit: socket.emit('admin:broadcast', { roomId, message })
       */
      socket.on('admin:broadcast', (data) => {
        try {
          if (socket.userRole !== 'ADMIN') {
            socket.emit('error', { message: 'Admin only' })
            return
          }

          const { roomId, message } = data

          if (!roomId || !message) {
            socket.emit('error', { message: 'Missing roomId or message' })
            return
          }

          console.log(`[Socket] Admin broadcast in room ${roomId}`)

          // Broadcast to specific room
          this.io.to(`room:${roomId}`).emit('message:new', {
            event: 'message:new',
            data: message,
            timestamp: new Date().toISOString()
          })

          socket.emit('broadcast:success', {
            messageId: message.id,
            roomId
          })
        } catch (err) {
          console.error('[Socket] admin:broadcast error:', err)
          socket.emit('error', { message: err.message })
        }
      })

      /**
       * Disconnect event
       */
      socket.on('disconnect', () => {
        try {
          const userId = socket.userId
          const role = socket.userRole

          console.log(`[Socket] User disconnected: ${userId}`)

          if (userId) {
            this.userSockets.delete(userId)

            // Notify admin về user offline
            if (role === 'USER') {
              this.io.to('admin:all').emit('user:status', {
                userId,
                status: 'offline',
                timestamp: new Date().toISOString()
              })
            }
          }
        } catch (err) {
          console.error('[Socket] disconnect error:', err)
        }
      })

      /**
       * Error handling
       */
      socket.on('error', (err) => {
        console.error(`[Socket] Error from ${socket.id}:`, err)
      })
    })
  }

  /**
   * Get user socket ID
   */
  getUserSocketId(userId) {
    return this.userSockets.get(userId)
  }

  /**
   * Send direct message to user
   */
  sendToUser(userId, eventName, data) {
    const socketId = this.getUserSocketId(userId)
    if (socketId) {
      this.io.to(socketId).emit(eventName, data)
    }
  }

  /**
   * Send message to room
   */
  sendToRoom(roomId, eventName, data) {
    this.io.to(`room:${roomId}`).emit(eventName, data)
  }

  /**
   * Send message to all admins
   */
  sendToAdmins(eventName, data) {
    this.io.to('admin:all').emit(eventName, data)
  }

  /**
   * Broadcast to everyone
   */
  broadcast(eventName, data) {
    this.io.emit(eventName, data)
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.userSockets.size
  }

  /**
   * Get all connected users
   */
  getConnectedUsers() {
    return Array.from(this.userSockets.entries()).map(([userId, socketId]) => ({
      userId,
      socketId
    }))
  }
}

module.exports = SocketHandler