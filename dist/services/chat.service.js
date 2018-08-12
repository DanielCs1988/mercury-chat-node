"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatService {
    constructor() {
        this.users = new Map();
    }
    userJoined(userId, socketId) {
        this.users.set(userId, { socketId });
    }
    userLeft(userId) {
        this.users.delete(userId);
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map