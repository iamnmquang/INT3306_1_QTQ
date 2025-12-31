const prisma = require('../../utils/prisma')

const ChatService = {
 
  /**
   * Kiểm tra user có quyền truy cập room này không
   */
  validateRoomAccess: async (userId, roomId, userRole) => {
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new Error('Room not found')
    }

    // User chỉ có thể xem room của chính mình
    if (userRole === 'USER' && room.userId !== userId) {
      throw new Error('Access denied - not your room')
    }

    return room
  },

  /**
   * Kiểm tra message ownership
   */
  validateMessageOwnership: async (messageId, userId) => {
    const msg = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { sender: true }
    })

    if (!msg) {
      throw new Error('Message not found')
    }

    if (msg.senderId !== userId) {
      throw new Error('Not message owner')
    }

    return msg
  },

  
  getOrCreateRoom: async (userId) => {
    let chatRoom = await prisma.chatRoom.findFirst({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: { userId },
        include: {
          messages: true
        }
      })
    }

    return chatRoom
  },

  /**
   * Get rooms for admin với unread count
   * 
   */
  getRoomsForAdmin: async () => {
    const rooms = await prisma.chatRoom.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderRole: 'USER'
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 
    return rooms.map(room => ({
      ...room,
      unreadCount: room._count.messages,
      _count: undefined // Remove _count từ response
    }))
  },

 

  getMessages: async (roomId) => {
    return prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
  },

  /**
   * Create message với validation
   * 
   */
  createMessage: async ({
    roomId,
    senderId,
    senderRole,
    content,
    attachments
  }) => {
    // ✅ FIX: Validate senderId
    const sender = await prisma.user.findUnique({
      where: { id: senderId }
    })

    if (!sender) {
      throw new Error('Sender user not found')
    }

    // If roomId missing and sender is USER, create/get the room automatically
    if (!roomId && senderRole === 'USER') {
      const room = await module.exports.getOrCreateRoom(sender.id)
      roomId = room.id
    }

    if (!roomId) {
      throw new Error('Room ID is required')
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new Error('Room not found')
    }

    if (senderRole === 'USER' && room.userId !== senderId) {
      throw new Error('Access denied - cannot send message to this room')
    }

    if (!content || content.trim() === '') {
      throw new Error('Message content cannot be empty')
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: sender.id,
        senderRole,
        content: content.trim(),
        attachments: attachments ?? null
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return message
  },

  /**
   * Delete message
   *
   */
  deleteMessage: async (messageId, userId) => {
    // Validate message ownership
    const msg = await module.exports.validateMessageOwnership(messageId, userId)

    // Optional: Prevent deleting messages older than 24 hours
    const messageAge = Date.now() - new Date(msg.createdAt).getTime()
    const twentyFourHoursMs = 24 * 60 * 60 * 1000

    if (messageAge > twentyFourHoursMs) {
      throw new Error('Cannot delete messages older than 24 hours')
    }

    const deleted = await prisma.chatMessage.delete({
      where: { id: messageId }
    })

    return deleted
  },

  /**
   * Edit message
   * 
   */
  editMessage: async (messageId, userId, newContent) => {
    // Validate message ownership
    const msg = await module.exports.validateMessageOwnership(messageId, userId)

    // Validate new content
    if (!newContent || newContent.trim() === '') {
      throw new Error('Message content cannot be empty')
    }

    // Optional: Prevent editing messages older than 1 hour
    const messageAge = Date.now() - new Date(msg.createdAt).getTime()
    const oneHourMs = 60 * 60 * 1000

    if (messageAge > oneHourMs) {
      throw new Error('Cannot edit messages older than 1 hour')
    }

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: newContent.trim(),
        isEdited: true // Nếu model có field này
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return updated
  },

 

  /**
   * Mark messages as read
   * 
   */
  markMessagesRead: async (roomId, forUserId) => {
    // ✅ FIX: Validate room access trước
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new Error('Room not found')
    }

    // User chỉ có thể mark read room của chính mình
    if (room.userId !== forUserId) {
      throw new Error('Access denied')
    }

    const result = await prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: forUserId },
        isRead: false
      },
      data: { isRead: true }
    })

    return result
  },

  /**
   * Get unread count cho một room
   */
  getUnreadCountByRoom: async (roomId, forUserId) => {
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new Error('Room not found')
    }

    // User chỉ có thể xem unread count của room mình
    if (room.userId !== forUserId) {
      throw new Error('Access denied')
    }

    return prisma.chatMessage.count({
      where: {
        roomId,
        isRead: false,
        senderId: { not: forUserId }
      }
    })
  },

  /**
   * Get all unread counts for admin
   */
  getUnreadCountsForAdmin: async () => {
    const rooms = await prisma.chatRoom.findMany({
      select: { id: true }
    })

    const result = {}
    for (const r of rooms) {
      result[r.id] = await prisma.chatMessage.count({
        where: {
          roomId: r.id,
          isRead: false,
          senderRole: 'USER'
        }
      })
    }

    return result
  },

 /**
 * Admin get chi tiết room + messages
 */
getAdminChatRoom: async (roomId) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }
    }
  })

  if (!room) {
    throw new Error('Room not found')
  }

  return room
}
}

module.exports = ChatService