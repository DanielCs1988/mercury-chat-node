"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_model_1 = require("../models/message.model");
class ChatController {
    constructor(socket, chatService, userId) {
        this.socket = socket;
        this.chatService = chatService;
        this.userId = userId;
        chatService.userJoined(userId, socket.id);
    }
    registerHandlers() {
        this.socket.server.emit("users" /* SEND_USERLIST */, this.chatService.getUserlist());
        this.socket.on("private/send" /* NEW_PRIVATE_MESSAGE */, (message, ack) => __awaiter(this, void 0, void 0, function* () {
            const msg = new message_model_1.Message(Object.assign({}, message, { from: this.userId }));
            try {
                const savedMsg = yield msg.save();
                const targetId = this.chatService.getSocketId(savedMsg.to);
                ack(null, savedMsg);
                if (targetId) {
                    this.socket.to(targetId).emit("private/receive" /* SEND_PRIVATE_MESSAGE */, savedMsg);
                }
            }
            catch (err) {
                ack(err);
            }
        }));
        this.socket.on("private/history" /* GET_PRIVATE_HISTORY */, (target, ack) => __awaiter(this, void 0, void 0, function* () {
            // TODO: validate friendship
            try {
                const messages = yield message_model_1.Message.find({
                    $or: [{
                            $and: [{ from: this.userId }, { to: target }]
                        }, {
                            $and: [{ from: target }, { to: this.userId }]
                        }]
                });
                ack(null, messages);
            }
            catch (e) {
                ack(e);
            }
        }));
        this.socket.on("disconnect" /* DISCONNECT */, () => {
            this.chatService.userLeft(this.userId);
            this.socket.server.emit("users" /* SEND_USERLIST */, this.chatService.getUserlist());
            console.log(`User ${this.userId} has left the server.`);
        });
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map