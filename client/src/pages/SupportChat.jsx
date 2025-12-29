import React, { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import axios from "../services/axios"
import "../styles/SupportChat.css"

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
        <div className="support-chat-page">
            <div className="support-chat-card">
                <div className="support-chat-header">
                    <h3>💬 Hỗ trợ khách hàng</h3>
                    <span className="status online">Admin online</span>
                </div>

                <div className="support-chat-messages">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`chat-message ${m.senderRole === "USER" ? "me" : "admin"
                                }`}
                        >
                            <div className="bubble">
                                <p>{m.content}</p>
                                <span className="time">
                                    {formatMessageTime(m.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isAdminTyping && (
                        <div className="typing-indicator">
                            Admin đang nhập...
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="support-chat-input">
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={message}
                        onChange={handleTyping}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage}>Gửi</button>
                </div>
            </div>
        </div>
    )

}
