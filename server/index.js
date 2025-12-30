require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); 
const app = require("./app");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

/* ===============================
   SOCKET HANDLER
================================ */
require("./socket/chat.socket")(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
    console.log(` Server running on ${PORT}`)
);
