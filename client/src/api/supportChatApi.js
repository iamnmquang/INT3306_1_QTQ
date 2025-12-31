import api, { setAccessToken } from './axios'

/**
 * Support Chat API
 * Backend routes: /support-chat
 */
export const supportChatApi = {
  // ============= USER ENDPOINTS =============

  /**
   * GET /support-chat/my-room
   * User lấy hoặc tạo chat room của mình
   */
  getMyRoom: async () => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.get('/support-chat/my-room')
    return res.data.data || res.data
  },

  /**
   * GET /support-chat/rooms/:roomId/messages
   * Lấy tất cả messages trong một room
   */
  getMessages: async (roomId) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.get(`/support-chat/rooms/${roomId}/messages`)
    return res.data.data || res.data
  },

  /**
   * POST /support-chat/rooms/:roomId/messages
   * User gửi message
   */
  sendMessage: async (roomId, content, attachments = null) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.post(`/support-chat/rooms/${roomId}/messages`, {
      content,
      attachments
    })
    return res.data.data || res.data
  },

  /**
   * PUT /support-chat/messages/:messageId
   * User edit message của mình
   */
  editMessage: async (messageId, content) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.put(`/support-chat/messages/${messageId}`, { content })
    return res.data.data || res.data
  },

  /**
   * DELETE /support-chat/messages/:messageId
   * User delete message của mình
   */
  deleteMessage: async (messageId) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.delete(`/support-chat/messages/${messageId}`)
    return res.data.data || res.data
  },

  /**
   * PUT /support-chat/rooms/:roomId/mark-read
   * Mark all messages in room as read
   */
  markRead: async (roomId) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.put(`/support-chat/rooms/${roomId}/mark-read`)
    return res.data.data || res.data
  },

  /**
   * GET /support-chat/rooms/:roomId/unread-count
   * Get unread count for a room
   */
  getUnreadCount: async (roomId) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.get(`/support-chat/rooms/${roomId}/unread-count`)
    return res.data.data || res.data
  },

  // ============= ADMIN ENDPOINTS =============

  /**
   * GET /support-chat/admin/rooms
   * Admin lấy danh sách tất cả chat rooms
   */
  getRoomsForAdmin: async () => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.get('/support-chat/admin/rooms')
    return res.data.data || res.data
  },

  /**
   * GET /support-chat/admin/rooms/:roomId
   * Admin lấy chi tiết một chat room
   */
  getAdminChatRoom: async (roomId) => {
    setAccessToken(localStorage.getItem('accessToken'))
    const res = await api.get(`/support-chat/admin/rooms/${roomId}`)
    return res.data.data || res.data
  },

 
}