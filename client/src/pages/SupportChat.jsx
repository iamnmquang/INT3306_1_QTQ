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
    <div className="max-w-3xl mx-auto px-4">
      <div className="h-[620px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200">

        {/* ===== Header ===== */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold leading-tight">
                Hỗ trợ khách hàng
              </h2>
              <p className="text-xs text-white/80">
                {adminTyping
                  ? 'Đội hỗ trợ đang nhập…'
                  : 'Chat trực tiếp với bộ phận hỗ trợ'}
              </p>
            </div>

            <span className="text-xs px-2 py-1 rounded-full bg-white/20">
              Online
            </span>
          </div>
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ===== Messages ===== */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageCircle className="w-14 h-14 mb-3 opacity-30" />
              <p className="text-sm">Bắt đầu cuộc trò chuyện với hỗ trợ</p>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.senderRole === 'USER'
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${isUser
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                      }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {msg.sender.name}
                    </p>

                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>

                    <p
                      className={`text-[11px] mt-1 text-right ${isUser ? 'text-blue-100' : 'text-slate-400'
                        }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ===== Input ===== */}
        <div className="px-4 py-3 bg-white border-t border-slate-200">
          <div className="flex items-center gap-3">
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
              placeholder="Nhập tin nhắn…"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={sendMessage}
              disabled={!content.trim() || loading}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

}