const router = require('express').Router()
const ChatController = require('./chat.controller')


const { isAuthenticated, authorizeRole } = require('../../utils/middlewares')

// ============= USER ROUTES =============

/**
 * GET /api/chat/my-room
 * User lấy room của mình (hoặc tạo nếu chưa có)
 */
router.get(
  '/my-room',
  isAuthenticated,
  ChatController.getMyRoom
)

/**
 * GET /api/chat/rooms/:roomId/messages
 * Get tất cả messages trong room
 */
router.get(
  '/rooms/:roomId/messages',
  isAuthenticated,
  ChatController.getMessages
)

/**
 * POST /api/chat/rooms/:roomId/messages
 * User gửi message
 */
router.post(
  '/rooms/:roomId/messages',
  isAuthenticated,
  ChatController.createMessage
)

/**
 * PUT /api/chat/messages/:messageId
 * Edit message của user
 */
router.put(
  '/messages/:messageId',
  isAuthenticated,
  ChatController.editMessage
)

/**
 * DELETE /api/chat/messages/:messageId
 * Delete message của user
 */
router.delete(
  '/messages/:messageId',
  isAuthenticated,
  ChatController.deleteMessage
)

/**
 * PUT /api/chat/rooms/:roomId/mark-read
 * Mark all messages in room as read
 */
router.put(
  '/rooms/:roomId/mark-read',
  isAuthenticated,
  ChatController.markRead
)

/**
 * GET /api/chat/rooms/:roomId/unread-count
 * Get unread count for a room
 */
router.get(
  '/rooms/:roomId/unread-count',
  isAuthenticated,
  ChatController.getUnreadCount
)

// ============= ADMIN ROUTES =============

/**
 * GET /api/chat/admin/rooms
 * Admin lấy danh sách tất cả chat rooms
 */
router.get(
  '/admin/rooms',
  isAuthenticated,
  authorizeRole('ADMIN'),
  ChatController.getRoomsForAdmin
)

 /**
 * GET /api/chat/admin/rooms/:roomId
 * Admin lấy chi tiết một chat room
 */
router.get(
  '/admin/rooms/:roomId',
  isAuthenticated,
  authorizeRole('ADMIN'),
  ChatController.getAdminChatRoom
)


module.exports = router