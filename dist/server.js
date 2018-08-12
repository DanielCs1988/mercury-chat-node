"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const chat_controller_1 = require("./controllers/chat.controller");
const mongoose_1 = require("mongoose");
const chat_service_1 = require("./services/chat.service");
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
mongoose_1.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
const chatService = new chat_service_1.ChatService();
io.on("connection" /* CONNECT */, (socket) => {
    const controller = new chat_controller_1.ChatController(socket, chatService, '');
    controller.registerHandlers();
    console.log(`Client ${socket.id} connected.`);
});
server.listen(port, () => console.log(`Chat API listening on port ${port}...`));
//# sourceMappingURL=server.js.map