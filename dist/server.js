"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const chat_controller_1 = require("./controllers/chat.controller");
const mongoose_1 = require("mongoose");
const chat_service_1 = require("./services/chat.service");
const authenticator_1 = require("./middleware/authenticator");
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
mongoose_1.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
const chatService = new chat_service_1.ChatService();
const authenticator = new authenticator_1.Authenticator();
const setupControllers = (err, socket, userId) => {
    if (!err) {
        const controller = new chat_controller_1.ChatController(socket, chatService, userId);
        controller.registerHandlers();
        console.log(`Client ${userId} connected.`);
    }
    else {
        console.log(err);
    }
};
io.on("connection" /* CONNECT */, (socket) => {
    authenticator.authenticate(socket, setupControllers);
});
server.listen(port, () => console.log(`Chat API listening on port ${port}...`));
//# sourceMappingURL=server.js.map