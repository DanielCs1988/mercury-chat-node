import {ChatService} from "../services/chat.service";
import {Actions} from "../models/models";
import {MessageModel, Message} from "../models/message.model";
import {validateFriendship} from "../services/friendship-validator";
import {Controller, SocketContext} from "../server/types";

export class ChatController implements Controller {

    constructor(private chatService: ChatService) {
        this.onPrivateHistory = this.onPrivateHistory.bind(this);
        this.onPrivateMessage = this.onPrivateMessage.bind(this);
    }

    handlers() {
        return {
            [Actions.NEW_PRIVATE_MESSAGE]: this.onPrivateMessage,
            [Actions.GET_PRIVATE_HISTORY]: this.onPrivateHistory,
            [Actions.DISCONNECT]: this.onDisconnect
        };
    }

    @validateFriendship
    private async onPrivateMessage(socket: SocketContext, message: MessageModel, ack: Function) {
        const userId = socket.credentials.userId;
        const msg = new Message({ ...message, from: userId });
        try {
            const savedMsg = await msg.save();
            const targetId = this.chatService.getSocketId(savedMsg.to);
            ack(null, savedMsg);
            if (targetId) {
                socket.to(targetId).emit(Actions.SEND_PRIVATE_MESSAGE, savedMsg);
            }
        } catch (err) {
            ack(err);
        }
    };

    @validateFriendship
    private async onPrivateHistory (socket: SocketContext, target: string, ack: Function) {
        const userId = socket.credentials.userId;
        try {
            const messages = await Message.find({
                $or: [{
                    $and: [{ from: userId }, { to: target }]
                }, {
                    $and: [{ from: target }, { to: userId }]
                }]
            });
            ack(null, messages);
        } catch (e) {
            ack(e);
        }
    };

    private onDisconnect = (socket: SocketContext) => {
        const userId = socket.credentials.userId;
        this.chatService.userLeft(userId);
        socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());
        console.log(`User ${userId} has left the server.`);
    };
}