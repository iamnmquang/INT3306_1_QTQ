import React, { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import axios from "../api/axios"


const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:4000"

export default function SupportChat() {
    /* ================= STATE ================= */
    const [user] = useState(() =>
        JSON.parse(localStorage.getItem("user"))
    )
    const [room, setRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [typing, setTyping] = useState(false)
    const [isAdminTyping, setIsAdminTyping] = useState(false)
    const socketRef = useRef(null)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    /* ================= AUTO SCROLL ================= */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        })
    }, [messages])

    /* ================= INIT ================= */
    useEffect(() => {
        if (!user) return

        const init = async () => {
            // 1️⃣ Lấy room của user
            const res = await axios.get("/support-chat/my-room")
            setRoom(res.data)

            // 2️⃣ Lấy message cũ
            const msgRes = await axios.get(
                `/support-chat/messages/${res.data.id}`
            )
            setMessages(msgRes.data)

            // 3️⃣ Kết nối socket
            socketRef.current = io(SOCKET_URL, {
                auth: {
                    token: localStorage.getItem("accessToken")
                }
            })

            // 4️⃣ Join room
            socketRef.current.emit("join-room", {
                roomId: res.data.id
            })

            /* ===== SOCKET LISTENERS ===== */

            socketRef.current.on("new-message", (msg) => {
                setMessages((prev) => [...prev, msg])
            })

            socketRef.current.on("typing", ({ isTyping }) => {
                setIsAdminTyping(isTyping)
            })

            socketRef.current.on("send-message-error", (err) => {
                console.error("Send error:", err.message)
            })
        }

        init()

        return () => {
            socketRef.current?.disconnect()
        }
    }, [user])

    /* ================= SEND MESSAGE ================= */
    const sendMessage = () => {
        if (!message.trim()) return

        socketRef.current.emit("send-message", {
            roomId: room?.id,
            content: message
        })

        setMessage("")
        stopTyping()
    }

    /* ================= TYPING ================= */
    const handleTyping = (e) => {
        setMessage(e.target.value)

        if (!typing) {
            setTyping(true)
            socketRef.current.emit("typing", {
                roomId: room.id,
                isTyping: true
            })
        }

        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(stopTyping, 800)
    }

    const stopTyping = () => {
        if (typing) {
            setTyping(false)
            socketRef.current.emit("typing", {
                roomId: room.id,
                isTyping: false
            })
        }
    }

    const formatMessageTime = (date) => {
        const d = new Date(date)
        const now = new Date()

        const isToday =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()

        if (isToday) {
            return d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit"
            })
        }

        return d.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
    }


    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8">
                    Hỗ trợ khách hàng
                </h1>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* ===== CONTACT INFO ===== */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="font-bold text-slate-900 mb-4">Liên hệ trực tiếp</h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        📞
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Hotline</p>
                                        <p className="font-semibold text-slate-900">0948004156</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        ✉️
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Email</p>
                                        <p className="font-semibold text-slate-900">
                                            23020136@vnu.edu.vn
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        ⏰
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Giờ làm việc</p>
                                        <p className="font-semibold text-slate-900">24/7</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                                🎧
                            </div>
                            <h3 className="font-bold text-lg mb-2">Cần hỗ trợ gấp?</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Đội ngũ tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
                            </p>
                            <button
                                className="w-full bg-white text-blue-600 font-semibold py-2 rounded-xl hover:bg-blue-50 transition"
                            >
                                📞 Gọi ngay: 0948004156
                            </button>
                        </div>
                    </div>

                    {/* ===== CHAT WINDOW ===== */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[600px] flex flex-col">

                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        💬
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Chat với Admin</h3>
                                        <p className="text-blue-100 text-sm">
                                            {isAdminTyping ? "Admin đang nhập..." : "Hỗ trợ trực tuyến"}
                                        </p>
                                    </div>
                                </div>
                                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
                                {messages.map((m) => {
                                    const isUser = m.senderRole === "USER"
                                    return (
                                        <div
                                            key={m.id}
                                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex items-end gap-2 max-w-[75%] ${isUser ? "flex-row-reverse" : ""}`}>
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                        ${isUser ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
                                                >
                                                    {isUser ? "U" : "A"}
                                                </div>

                                                <div>
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl text-sm
                          ${isUser
                                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                                                : "bg-white border text-slate-800"}`}
                                                    >
                                                        {m.content}
                                                    </div>
                                                    <p className={`text-xs text-slate-400 mt-1 ${isUser ? "text-right" : ""}`}>
                                                        {formatMessageTime(m.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="border-t border-slate-200 px-4 py-4 bg-white">
                                <div className="flex items-end gap-3">
                                    <input
                                        value={message}
                                        onChange={handleTyping}
                                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-4 py-2.5 border rounded-full focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )





}