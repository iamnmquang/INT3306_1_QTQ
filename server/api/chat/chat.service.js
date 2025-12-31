const prisma = require('../../utils/prisma')

const ChatService = {
    getOrCreateRoom: async (userId) => {
        let room = await prisma.chatRoom.findFirst({
            where: { userId }
        })

        if (!room) {
            room = await prisma.chatRoom.create({
                data: { userId }
            })
        }

        return room
    },

    getRoomsForAdmin: async () => {
        return prisma.chatRoom.findMany({
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
                    take: 1
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


    createMessage: async ({
        roomId,
        senderId,
        senderRole,
        content,
        attachments
    }) => {
        // 🔒 validate senderId
        const sender = await prisma.user.findUnique({
            where: { id: senderId }
        })

        if (!sender) {
            throw new Error('Sender user not found')
        }

        return prisma.chatMessage.create({
            data: {
                roomId,
                senderId: sender.id,
                senderRole,
                content,
                attachments: attachments ?? null
            }
        })
    },

    markMessagesRead: async (roomId, forUserId) => {
        return prisma.chatMessage.updateMany({
            where: {
                roomId,
                senderId: { not: forUserId },
                isRead: false
            },
            data: { isRead: true }
        })
    },

    getUnreadCountByRoom: async (roomId, forUserId) => {
        return prisma.chatMessage.count({
            where: {
                roomId,
                isRead: false,
                senderId: { not: forUserId }
            }
        })
    },

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
    }
}

module.exports = ChatService
