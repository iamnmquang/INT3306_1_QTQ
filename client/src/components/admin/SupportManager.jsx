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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8">
          Chat hỗ trợ khách hàng
        </h1>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[700px] flex">

          {/* ================= LEFT: ROOMS ================= */}
          <div className="w-80 border-r border-slate-200 flex flex-col">

            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khách hàng..."
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Room list */}
            <div className="flex-1 overflow-y-auto">
              {filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Chưa có cuộc hội thoại</p>
                </div>
              ) : (
                filteredRooms.map(room => {
                  const lastMsg = room.messages?.[0]
                  const isActive = activeRoom?.id === room.id

                  return (
                    <button
                      key={room.id}
                      onClick={() => openRoom(room)}
                      className={`w-full text-left p-3 border-b hover:bg-slate-50 transition-colors ${isActive ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {getInitials(room.user.name)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {room.user.name}
                            </p>
                            {lastMsg && (
                              <span className="text-xs text-slate-400">
                                {formatTime(lastMsg.createdAt)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 truncate">
                            {lastMsg ? formatShort(lastMsg.content) : 'Chưa có tin nhắn'}
                          </p>
                        </div>

                        {/* Unread */}
                        {room.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT: CHAT ================= */}
          <div className="flex-1 flex flex-col">
            {!activeRoom ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <MessageSquare className="w-14 h-14 mx-auto mb-4 text-slate-300" />
                  <p>Chọn một cuộc hội thoại để bắt đầu</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {activeRoom.user.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {userTyping ? (
                        <span className="text-blue-600">Đang nhập...</span>
                      ) : (
                        activeRoom.user.email
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {activeRoom.createdAt &&
                      new Date(activeRoom.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400">
                      Bắt đầu cuộc trò chuyện
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isAdmin = msg.senderRole === 'ADMIN'
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${isAdmin
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-white border text-slate-900'
                              }`}
                          >
                            <p className="text-sm break-words">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 text-right ${isAdmin ? 'text-blue-100' : 'text-slate-400'
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

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!content.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

}