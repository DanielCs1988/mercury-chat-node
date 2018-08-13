import {Socket} from "socket.io";
import {ChatService} from "../services/chat.service";
import {Actions} from "../models/models";
import {MessageModel, Message} from "../models/message.model";
import {validateFriendship} from "../services/friendship-validator";

export class ChatController {

    constructor(
        private socket: Socket,
        private chatService: ChatService,
        private userId: string,
        private token: string
    ) {
        chatService.userJoined(userId, socket.id);
        this.onPrivateHistory = this.onPrivateHistory.bind(this);
        this.onPrivateMessage = this.onPrivateMessage.bind(this);
    }

    registerHandlers() {
        this.socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());
        this.socket.on(Actions.NEW_PRIVATE_MESSAGE, this.onPrivateMessage);
        this.socket.on(Actions.GET_PRIVATE_HISTORY, this.onPrivateHistory);
        this.socket.on(Actions.DISCONNECT, this.onDisconnect);
    }

    @validateFriendship
    private async onPrivateMessage(message: MessageModel, ack: Function) {
        const msg = new Message({ ...message, from: this.userId });
        try {
            const savedMsg = await msg.save();
            const targetId = this.chatService.getSocketId(savedMsg.to);
            ack(null, savedMsg);
            if (targetId) {
                this.socket.to(targetId).emit(Actions.SEND_PRIVATE_MESSAGE, savedMsg);
            }
        } catch (err) {
            ack(err);
        }
    };

    @validateFriendship
    private async onPrivateHistory (target: string, ack: Function) {
        try {
            const messages = await Message.find({
                $or: [{
                    $and: [{ from: this.userId }, { to: target }]
                }, {
                    $and: [{ from: target }, { to: this.userId }]
                }]
            });
            ack(null, messages);
        } catch (e) {
            ack(e);
        }
    };

    private onDisconnect = () => {
        this.chatService.userLeft(this.userId);
        this.socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());
        console.log(`User ${this.userId} has left the server.`);
    };
}