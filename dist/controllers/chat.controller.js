"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatController {
    constructor(socket, chatService, userId) {
        this.socket = socket;
        this.chatService = chatService;
        this.userId = userId;
        chatService.userJoined('', socket.id);
    }
    registerHandlers() {
        // setup handlers here
        this.socket.on("disconnect" /* DISCONNECT */, () => {
            this.chatService.userLeft(this.userId);
            console.log(`User ${this.socket.id} has left the server.`);
        });
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map