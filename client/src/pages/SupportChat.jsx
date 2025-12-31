import React, { useEffect, useRef, useState } from 'react'
import { supportChatApi } from '../api/supportChatApi'
import { setAccessToken } from '../api/axios'
import io from 'socket.io-client'
import { Send, MessageCircle } from 'lucide-react'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

export default function SupportChat() {
  const socketRef = useRef(null)
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [adminTyping, setAdminTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // ============= INITIALIZE =============

  useEffect(() => {
    setAccessToken(localStorage.getItem('accessToken'))
    loadRoom()

    // Initialize socket
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken'),
        role: 'USER'
      }
    })

    socketRef.current.on('connect', () => {
      console.log('[Socket] User connected')
      socketRef.current.emit('user:join', {
        userId: localStorage.getItem('userId'),
        role: 'USER'
      })
    })

    // Admin sent message
    socketRef.current.on('message:new', (data) => {
      const { data: message } = data
      setMessages(prev => [...prev, message])
    })

    // Admin is typing
    socketRef.current.on('user:typing', ({ isTyping }) => {
      setAdminTyping(isTyping)
    })

    // Message deleted
    socketRef.current.on('message:deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    })

    // Message edited
    socketRef.current.on('message:edited', ({ data: editedMsg }) => {
      setMessages(prev =>
        prev.map(m => m.id === editedMsg.id ? editedMsg : m)
      )
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // ============= AUTO SCROLL =============

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ============= LOAD ROOM =============

  const loadRoom = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessToken(localStorage.getItem('accessToken'))

      const roomData = await supportChatApi.getMyRoom()
      setRoom(roomData)

      // Fetch messages
      const msgs = await supportChatApi.getMessages(roomData.id)
      setMessages(msgs)

      // Mark as read
      await supportChatApi.markRead(roomData.id)

      // Join room via socket
      if (socketRef.current?.emit) {
        socketRef.current.emit('chat:join', { roomId: roomData.id })
      }
    } catch (err) {
      console.error('[Error] Load room:', err)
      setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ============= SEND MESSAGE =============

  const sendMessage = async () => {
    if (!content.trim() || !room) return

    const messageContent = content
    setContent('')

    try {
      setAccessToken(localStorage.getItem('accessToken'))

      // Send via API
      const message = await supportChatApi.sendMessage(room.id, messageContent)

      // Broadcast via socket
      if (socketRef.current?.emit) {
        socketRef.current.emit('message:new', {
          roomId: room.id,
          message
        })
      }

      setMessages(prev => [...prev, message])
    } catch (err) {
      console.error('[Error] Send message:', err)
      setContent(messageContent) // Restore on error
      setError('Gửi tin nhắn thất bại')
    }
  }

  // ============= FORMAT HELPERS =============

  const formatTime = (date) => {
    const d = new Date(date)
    const today = new Date()

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('vi-VN')
  }

  // ============= RENDER =============

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg overflow-hidden bg-white shadow-lg flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h2 className="font-semibold">Hỗ trợ khách hàng</h2>
              <p className="text-sm text-blue-100">
                {adminTyping ? 'Đội hỗ trợ đang nhập...' : 'Nhắn tin trực tiếp với đội hỗ trợ'}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Bắt đầu cuộc trò chuyện</p>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.senderRole === 'USER'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {msg.sender.name}
                  </p>
                  <p className="text-sm break-words">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      msg.senderRole === 'USER'
                        ? 'text-blue-100'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!content.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}