const ChatService = require('./chat.service')

const ChatController = {
    getMyRoom: async (req, res) => {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(400).json({ message: "Missing user id" });
            }

            const room = await ChatService.getOrCreateRoom(userId);
            res.json(room);
        } catch (err) {
            console.error("getMyRoom error:", err);
            res.status(500).json({ message: err.message });
        }
    },


    getMessages: async (req, res) => {
        try {
            const messages = await ChatService.getMessages(
                req.params.roomId
            )
            res.json(messages)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    },

    getRoomsForAdmin: async (req, res) => {
        try {
            const rooms = await ChatService.getRoomsForAdmin()
            res.json(rooms)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    },

    markRead: async (req, res) => {
        try {
            const result = await ChatService.markMessagesRead(
                req.params.roomId,
                req.user.id
            )
            res.json(result)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

module.exports = ChatController
