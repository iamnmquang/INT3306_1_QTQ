const jwt = require('jsonwebtoken')
const ChatService = require('../api/chat/chat.service')

module.exports = (io) => {
    /* ================= AUTH SOCKET ================= */
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Unauthorized"));

            const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            socket.user = {
                id: payload.id || payload.userId, // 🔥 FIX Ở ĐÂY
                role: payload.role,
                email: payload.email,
            };

            console.log("🟢 Socket connected:", socket.user);
            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });


    /* ================= CONNECTION ================= */
    io.on('connection', async (socket) => {
        console.log('🟢 Socket connected:', socket.user)

        /* ===== ADMIN AUTO JOIN ALL ROOMS ===== */
        if (socket.user.role === 'ADMIN') {
            const rooms = await ChatService.getRoomsForAdmin()
            rooms.forEach(r => socket.join(r.id))
            console.log('👮 Admin joined all rooms')
        }

        /* ===== JOIN ROOM ===== */
        socket.on('join-room', async ({ roomId }) => {
            try {
                socket.join(roomId)

                await ChatService.markMessagesRead(
                    roomId,
                    socket.user.id
                )

                socket.emit('joined-room', { roomId })
            } catch (err) {
                socket.emit('join-room-error', {
                    message: 'Cannot join room'
                })
            }
        })

        /* ===== SEND MESSAGE ===== */
        socket.on('send-message', async (data) => {
            try {
                let { roomId, content, attachments } = data

                if (!content) {
                    return socket.emit('send-message-error', {
                        message: 'Content is required'
                    })
                }

                // USER gửi lần đầu → tự tạo room
                if (!roomId && socket.user.role === 'USER') {
                    const room = await ChatService.getOrCreateRoom(
                        socket.user.id
                    )
                    roomId = room.id
                }

                const message = await ChatService.createMessage({
                    roomId,
                    senderId: socket.user.id,
                    senderRole: socket.user.role,
                    content,
                    attachments
                })

                // gửi cho tất cả client trong room
                io.to(roomId).emit('new-message', message)

                // cập nhật sidebar admin
                io.emit('room-updated', {
                    roomId,
                    lastMessage: message
                })
            } catch (err) {
                console.error(err)
                socket.emit('send-message-error', {
                    message: 'Cannot send message'
                })
            }
        })

        /* ===== TYPING ===== */
        socket.on('typing', ({ roomId, isTyping }) => {
            socket.to(roomId).emit('typing', {
                userId: socket.user.id,
                isTyping
            })
        })

        /* ===== DISCONNECT ===== */
        socket.on('disconnect', () => {
            console.log('🔴 Socket disconnected:', socket.user.id)
        })
    })
}
