import { io } from "socket.io-client";

let socket = null;

/**
 * Connect socket with JWT access token
 * @param {string} token - JWT access token
 */
export function connectSocket(token) {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
        transports: ["websocket"],
        autoConnect: true,
        auth: {
            token: token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("🔴 Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
    });

    return socket;
}

/**
 * Disconnect socket safely
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("🔌 Socket disconnected manually");
    }
}

/**
 * Get current socket instance
 */
export function getSocket() {
    return socket;
}