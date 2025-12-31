let ioInstance = null

module.exports = {
  /**
   * Set io instance globally
   * @param {Server} io - Socket.io server instance
   */
  setIo: (io) => {
    ioInstance = io
    console.log('[Socket Utils] IO instance set')
  },

  /**
   * Get io instance
   * @returns {Server|null} Socket.io server instance
   */
  getIo: () => ioInstance,

  /**
   * Check if io is available
   * @returns {boolean}
   */
  hasIo: () => ioInstance !== null,

  /**
   * Send to room
   * @param {string} room
   * @param {string} event
   * @param {*} data
   */
  sendToRoom: (room, event, data) => {
    if (ioInstance) {
      ioInstance.to(room).emit(event, data)
    }
  },

  /**
   * Send to user
   * @param {string} userId
   * @param {string} event
   * @param {*} data
   */
  sendToUser: (userId, event, data) => {
    if (ioInstance) {
      ioInstance.to(`user:${userId}`).emit(event, data)
    }
  },

  /**
   * Send to admins
   * @param {string} event
   * @param {*} data
   */
  sendToAdmins: (event, data) => {
    if (ioInstance) {
      ioInstance.to('admin:all').emit(event, data)
    }
  },

  /**
   * Broadcast to all
   * @param {string} event
   * @param {*} data
   */
  broadcast: (event, data) => {
    if (ioInstance) {
      ioInstance.emit(event, data)
    }
  }
}