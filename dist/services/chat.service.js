"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatService {
    constructor() {
        this.users = new Map();
    }
    getSocketId(userId) {
        const user = this.users.get(userId);
        return user ? user.socketId : null;
    }
    getUserlist() {
        return [...this.users.keys()];
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