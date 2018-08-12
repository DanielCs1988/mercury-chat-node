import {Socket} from "socket.io";
import {ChatService} from "../services/chat.service";
import {Actions} from "../models/models";
import {MessageModel, Message} from "../models/message.model";

export class ChatController {

    constructor(private socket: Socket, private chatService: ChatService, private userId: string) {
        chatService.userJoined(userId, socket.id);
    }

    registerHandlers() {

        this.socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());

        this.socket.on(Actions.NEW_PRIVATE_MESSAGE, async (message: MessageModel, ack: Function) => {
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
        });

        this.socket.on(Actions.GET_PRIVATE_HISTORY, async (target: string, ack: Function) => {
            // TODO: validate friendship
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
        });

        this.socket.on(Actions.DISCONNECT, () => {
            this.chatService.userLeft(this.userId);
            this.socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());
            console.log(`User ${this.userId} has left the server.`);
        });
    }
}