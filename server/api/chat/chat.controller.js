const ChatService = require('./chat.service')
const { getIo } = require('../../utils/socket')

const ChatController = {
  // ============= USER ENDPOINTS =============

  /**
   * GET /api/chat/my-room
   * Get hoặc create chat room cho user
   */
  getMyRoom: async (req, res) => {
    try {
      const userId = req.user.id

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing user id'
        })
      }

      const room = await ChatService.getOrCreateRoom(userId)

      res.json({
        success: true,
        data: room
      })
    } catch (err) {
      console.error('getMyRoom error:', err)
      res.status(500).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
   * GET /api/chat/rooms/:roomId/messages
   * Get all messages trong một room
   * ✅ FIX: Thêm access validation
   */
  getMessages: async (req, res) => {
    try {
      const { roomId } = req.params
      const userId = req.user.id

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        })
      }

      // ✅ FIX: Validate access
      await ChatService.validateRoomAccess(userId, roomId, req.user.role)

      const messages = await ChatService.getMessages(roomId)

      res.json({
        success: true,
        data: messages
      })
    } catch (err) {
      console.error('getMessages error:', err)
      const statusCode = err.message.includes('Access denied') ? 403 : 500
      res.status(statusCode).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
   * POST /api/chat/rooms/:roomId/messages
   * Create new message
   * 
   */
  createMessage: async (req, res) => {
    try {
      const { roomId } = req.params
      const { content, attachments } = req.body
      const userId = req.user.id

      // Validate input
      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        })
      }

      // ✅ FIX: Validate access trước khi tạo message
      await ChatService.validateRoomAccess(userId, roomId, req.user.role)

      const message = await ChatService.createMessage({
        roomId,
        senderId: userId,
        senderRole: req.user.role,
        content,
        attachments
      })

      // Emit via socket
      const io = getIo()
      if (io) {
        // Gửi tới room
        io.to(message.roomId).emit('new-message', {
          event: 'new-message',
          data: message
        })
        // Notify room updated (cho admin sidebar)
        io.emit('room-updated', {
          roomId: message.roomId,
          lastMessage: message
        })
      }

      res.status(201).json({
        success: true,
        data: message
      })
    } catch (err) {
      console.error('createMessage error:', err)
      const statusCode = err.message.includes('Access denied') ? 403 : 400
      res.status(statusCode).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
   * DELETE /api/chat/messages/:messageId
   * Delete message
   * ✅ THÊM MỚI
   */
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params
      const userId = req.user.id

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID is required'
        })
      }

      const deletedMsg = await ChatService.deleteMessage(messageId, userId)

      // Emit via socket
      const io = getIo()
      if (io) {
        io.to(deletedMsg.roomId).emit('message-deleted', {
          event: 'message-deleted',
          messageId: deletedMsg.id
        })
      }

      res.json({
        success: true,
        message: 'Message deleted',
        data: { id: deletedMsg.id }
      })
    } catch (err) {
      console.error('deleteMessage error:', err)
      const statusCode = err.message.includes('Not message owner') ? 403 : 400
      res.status(statusCode).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
   * PUT /api/chat/messages/:messageId
   * Edit message
   * ✅ THÊM MỚI
   */
  editMessage: async (req, res) => {
    try {
      const { messageId } = req.params
      const { content } = req.body
      const userId = req.user.id

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID is required'
        })
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        })
      }

      const editedMsg = await ChatService.editMessage(messageId, userId, content)

      // Emit via socket
      const io = getIo()
      if (io) {
        io.to(editedMsg.roomId).emit('message-edited', {
          event: 'message-edited',
          data: editedMsg
        })
      }

      res.json({
        success: true,
        data: editedMsg
      })
    } catch (err) {
      console.error('editMessage error:', err)
      const statusCode = err.message.includes('Not message owner') ? 403 : 400
      res.status(statusCode).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
   * PUT /api/chat/rooms/:roomId/mark-read
   * Mark all messages in room as read
   * ✅ FIX: Thêm better error handling
   */
  markRead: async (req, res) => {
    try {
      const { roomId } = req.params
      const userId = req.user.id

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        })
      }

      const result = await ChatService.markMessagesRead(roomId, userId)

      // Emit via socket
      const io = getIo()
      if (io) {
        io.to(roomId).emit('messages-marked-read', {
          event: 'messages-marked-read',
          roomId
        })
      }

      res.json({
        success: true,
        message: 'Messages marked as read',
        data: result
      })
    } catch (err) {
      console.error('markRead error:', err)
      const statusCode = err.message.includes('Access denied') ? 403 : 500
      res.status(statusCode).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
   * GET /api/chat/rooms/:roomId/unread-count
   * Get unread count for a room
   * ✅ THÊM MỚI
   */
  getUnreadCount: async (req, res) => {
    try {
      const { roomId } = req.params
      const userId = req.user.id

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        })
      }

      const unreadCount = await ChatService.getUnreadCountByRoom(roomId, userId)

      res.json({
        success: true,
        data: { roomId, unreadCount }
      })
    } catch (err) {
      console.error('getUnreadCount error:', err)
      const statusCode = err.message.includes('Access denied') ? 403 : 500
      res.status(statusCode).json({
        success: false,
        message: err.message
      })
    }
  },

  // ============= ADMIN ENDPOINTS =============

  /**
   * GET /api/chat/admin/rooms
   * Get all chat rooms (admin only)
   * ✅ FIX: Thêm admin role check
   */
  getRoomsForAdmin: async (req, res) => {
    try {
      // ✅ FIX: Check admin role
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden - Admin only'
        })
      }

      const rooms = await ChatService.getRoomsForAdmin()

      res.json({
        success: true,
        data: rooms
      })
    } catch (err) {
      console.error('getRoomsForAdmin error:', err)
      res.status(500).json({
        success: false,
        message: err.message
      })
    }
  },

  /**
 * GET /api/chat/admin/rooms/:roomId
 * Admin get chi tiết một room
 */
getAdminChatRoom: async (req, res) => {
  try {
    const { roomId } = req.params

    // Check admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Admin only'
      })
    }

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      })
    }

    const room = await ChatService.getAdminChatRoom(roomId)

    res.json({
      success: true,
      data: room
    })
  } catch (err) {
    console.error('getAdminChatRoom error:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
},


}


module.exports = ChatController