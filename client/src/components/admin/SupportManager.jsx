import React, { useEffect, useRef, useState } from "react";
import axios from "../../api/axios";
import io from "socket.io-client";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function SupportManager() {
    /* ================= CURRENT USER ================= */
    const currentUser = JSON.parse(localStorage.getItem("user"));

    /* ================= STATE ================= */
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    /* ================= AUTO SCROLL ================= */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ================= LOAD ROOMS ================= */
    const loadRooms = async () => {
        const res = await axios.get("/support-chat/rooms");
        setRooms(res.data);
    };

    /* ================= INIT SOCKET (CHỈ 1 LẦN) ================= */
    useEffect(() => {
        loadRooms();

        socketRef.current = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem("accessToken"),
            },
        });

        socketRef.current.on("new-message", (msg) => {
            if (msg.roomId === activeRoom?.id) {
                setMessages((prev) => [...prev, msg]);
            }
            loadRooms();
        });

        return () => socketRef.current.disconnect();
    }, []); // ❗ KHÔNG phụ thuộc activeRoom

    /* ================= OPEN ROOM ================= */
    const openRoom = async (room) => {
        setActiveRoom(room);

        // Admin join room (fix lỗi không thấy tin room tạo sau)
        socketRef.current.emit("join-room", {
            roomId: room.id,
        });

        const res = await axios.get(
            `/support-chat/messages/${room.id}`
        );
        setMessages(res.data);

        await axios.post(
            `/support-chat/messages/${room.id}/mark-read`
        );

        loadRooms();
    };

    /* ================= SEND MESSAGE ================= */
    const sendMessage = () => {
        if (!content.trim() || !activeRoom) return;

        socketRef.current.emit("send-message", {
            roomId: activeRoom.id,
            content,
        });

        setContent("");
    };

    /* ================= UI ================= */
    return (
        <div className="h-[calc(100vh-80px)] flex bg-slate-100 rounded-xl overflow-hidden">

            {/* ===== LEFT: ROOM LIST ===== */}
            <div className="w-80 bg-white border-r">
                <div className="p-4 font-semibold border-b">
                    Hỗ trợ khách hàng
                </div>

                <div className="overflow-y-auto h-full">
                    {rooms.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => openRoom(r)}
                            className={`w-full p-4 text-left border-b hover:bg-slate-50
                            ${activeRoom?.id === r.id ? "bg-blue-50" : ""}`}
                        >
                            <div className="font-medium">{r.user.name}</div>
                            <div className="text-xs text-slate-500">
                                {r.user.email}
                            </div>

                            {r._count.messages > 0 && (
                                <span className="inline-block mt-2 px-2 py-0.5 text-xs
                                bg-red-500 text-white rounded-full">
                                    {r._count.messages} tin mới
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== RIGHT: CHAT ===== */}
            <div className="flex-1 flex flex-col">
                {!activeRoom ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Chọn một cuộc hội thoại
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b font-semibold">
                            Chat với {activeRoom.user.name}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((m) => {
                                // 🔥 FIX QUAN TRỌNG: phân biệt bằng ROLE
                                const isAdmin = m.senderRole === "ADMIN";

                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${isAdmin ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`px-4 py-2 rounded-xl max-w-lg text-sm
                                            ${isAdmin
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white border"
                                                }`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t flex gap-2">
                            <input
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && sendMessage()
                                }
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                            >
                                Gửi
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
