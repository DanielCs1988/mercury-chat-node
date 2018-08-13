"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const friendship_validator_1 = require("../services/friendship-validator");
class ChatController {
    constructor(socket, chatService, userId, token) {
        this.socket = socket;
        this.chatService = chatService;
        this.userId = userId;
        this.token = token;
        this.onDisconnect = () => {
            this.chatService.userLeft(this.userId);
            this.socket.server.emit("users" /* SEND_USERLIST */, this.chatService.getUserlist());
            console.log(`User ${this.userId} has left the server.`);
        };
        chatService.userJoined(userId, socket.id);
        this.onPrivateHistory = this.onPrivateHistory.bind(this);
        this.onPrivateMessage = this.onPrivateMessage.bind(this);
    }
    registerHandlers() {
        this.socket.server.emit("users" /* SEND_USERLIST */, this.chatService.getUserlist());
        this.socket.on("private/send" /* NEW_PRIVATE_MESSAGE */, this.onPrivateMessage);
        this.socket.on("private/history" /* GET_PRIVATE_HISTORY */, this.onPrivateHistory);
        this.socket.on("disconnect" /* DISCONNECT */, this.onDisconnect);
    }
    onPrivateMessage(message, ack) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    ;
    onPrivateHistory(target, ack) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    ;
}
__decorate([
    friendship_validator_1.validateFriendship
], ChatController.prototype, "onPrivateMessage", null);
__decorate([
    friendship_validator_1.validateFriendship
], ChatController.prototype, "onPrivateHistory", null);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map