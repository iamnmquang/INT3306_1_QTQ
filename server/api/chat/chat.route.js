const router = require('express').Router()
const ChatController = require('./chat.controller')
const {
    isAuthenticated,
    authorizeRole
} = require('../../utils/middlewares')

router.get('/my-room', isAuthenticated, ChatController.getMyRoom)
router.get('/messages/:roomId', isAuthenticated, ChatController.getMessages)
router.post(
    '/messages/:roomId/mark-read',
    isAuthenticated,
    ChatController.markRead
)

router.get(
    '/rooms',
    isAuthenticated,
    authorizeRole('ADMIN'),
    ChatController.getRoomsForAdmin
)

module.exports = router
