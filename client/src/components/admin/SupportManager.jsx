import React, { useEffect, useRef, useState } from 'react'
import { supportChatApi } from '../../api/supportChatApi'
import { setAccessToken } from '../../api/axios'
import io from 'socket.io-client'
import { ChevronLeft, Send, MessageSquare, Users } from 'lucide-react'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

export default function SupportManager() {
  const socketRef = useRef(null)
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const activeRoomRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [userTyping, setUserTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  // ============= INITIALIZE SOCKET =============

  useEffect(() => {
    setAccessToken(localStorage.getItem('accessToken'))
    loadRooms()

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken'),
        role: 'ADMIN'
      }
    })

    // Socket connected
    socketRef.current.on('connect', () => {
      console.log('[Socket] Admin connected')
      socketRef.current.emit('user:join', {
        userId: localStorage.getItem('userId'),
        role: 'ADMIN'
      })
    })

    // New message event
    socketRef.current.on('message:new', (data) => {
      const { data: message } = data
      
      // Reload rooms untuk update sidebar
      loadRooms()
      
      // Add message nếu active room match
      if (message.roomId === activeRoomRef.current?.id) {
        setMessages(prev => [...prev, message])
      }
    })

    // User typing event
    socketRef.current.on('user:typing', ({ userId, isTyping }) => {
      if (activeRoomRef.current?.user?.id === userId) {
        setUserTyping(isTyping)
      }
    })

    // Message deleted event
    socketRef.current.on('message:deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    })

    // Message edited event
    socketRef.current.on('message:edited', ({ data: editedMsg }) => {
      setMessages(prev =>
        prev.map(m => m.id === editedMsg.id ? editedMsg : m)
      )
    })

    // Room updated event
    socketRef.current.on('room:updated', ({ roomId }) => {
      loadRooms()
    })

    // Connection error
    socketRef.current.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err?.message || err)
    })

    // Disconnect
    socketRef.current.on('disconnect', () => {
      console.log('[Socket] Admin disconnected')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
  activeRoomRef.current = activeRoom
}, [activeRoom])

  // ============= AUTO SCROLL TO BOTTOM =============

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ============= LOAD ROOMS =============

  const loadRooms = async () => {
    try {
      setAccessToken(localStorage.getItem('accessToken'))
      const res = await supportChatApi.getRoomsForAdmin()
      setRooms(res)
    } catch (err) {
      console.error('[Error] Load rooms:', err)
    }
  }

  // ============= OPEN ROOM =============

  const openRoom = async (room) => {
    setLoading(true)
    try {
      setAccessToken(localStorage.getItem('accessToken'))
      
      // Emit socket event to join room
      if (socketRef.current?.emit) {
        socketRef.current.emit('chat:join', { roomId: room.id })
      }

      // Fetch messages
      const res = await supportChatApi.getAdminChatRoom(room.id)
      setMessages(res.messages || [])
      setActiveRoom(res)
      activeRoomRef.current = res

      // Mark as read
      await supportChatApi.markRead(room.id)
      loadRooms()
    } catch (err) {
      console.error('[Error] Open room:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  // ============= SEND MESSAGE =============

  const sendMessage = async () => {
    if (!content.trim() || !activeRoom) return

    const messageContent = content
    setContent('')

    try {
      setAccessToken(localStorage.getItem('accessToken'))

      // Send via API
      const message = await supportChatApi.sendMessage(
        activeRoom.id,
        messageContent
      )

      // Broadcast via socket
      if (socketRef.current?.emit) {
        socketRef.current.emit('message:new', {
          roomId: activeRoom.id,
          message
        })
      }

      // Add to local messages
      setMessages(prev => [...prev, message])
      loadRooms()
    } catch (err) {
      console.error('[Error] Send message:', err)
      setContent(messageContent) // Restore content on error
    }
  }

  // ============= FILTER ROOMS =============

  const filteredRooms = rooms.filter(room =>
    !searchQuery ||
    room.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ============= FORMAT HELPERS =============

  const formatTime = (date) => {
    const d = new Date(date)
    const today = new Date()
    
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('vi-VN')
  }

  const formatShort = (text) => {
    return text.length > 40 ? text.substring(0, 37) + '...' : text
  }

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('')
      : 'U'
  }

  // ============= RENDER =============

  return (
    <div className="h-[80vh] rounded-xl overflow-hidden bg-white shadow-lg flex">
      {/* ============= LEFT: ROOMS LIST ============= */}

      <div className="w-96 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Hộp tin nhắn</h2>
          </div>
          <p className="text-sm text-gray-500">
            {rooms.length} cuộc trò chuyện
          </p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Không có cuộc trò chuyện</p>
            </div>
          ) : (
            filteredRooms.map(room => {
              const lastMsg = room.messages?.[0]
              const isActive = activeRoom?.id === room.id

              return (
                <button
                  key={room.id}
                  onClick={() => openRoom(room)}
                  className={`w-full flex items-start gap-3 p-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100 ${
                    isActive ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {getInitials(room.user.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-gray-900 truncate">
                        {room.user.name}
                      </div>
                      {lastMsg && (
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(lastMsg.createdAt)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="text-sm text-gray-500 truncate">
                        {lastMsg ? formatShort(lastMsg.content) : 'Chưa có tin nhắn'}
                      </div>

                      {/* Unread badge */}
                      {room.unreadCount > 0 && (
                        <div className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                      {room.user.email}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ============= RIGHT: CHAT AREA ============= */}

      <div className="flex-1 flex flex-col bg-white">
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveRoom(null)
                    activeRoomRef.current = null
                    setMessages([])
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activeRoom.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userTyping ? (
                      <span className="text-blue-600">Đang nhập...</span>
                    ) : (
                      activeRoom.user.email
                    )}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                {activeRoom.createdAt &&
                  new Date(activeRoom.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Bắt đầu cuộc trò chuyện</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.senderRole === 'ADMIN'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          msg.senderRole === 'ADMIN'
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

            {/* Message Input */}
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
                />
                <button
                  onClick={sendMessage}
                  disabled={!content.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}