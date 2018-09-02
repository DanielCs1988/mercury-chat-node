import {ChatService} from "../services/chat.service";
import {Actions} from "../models/models";
import {MessageModel, Message} from "../models/message.model";
import {Controller, SocketContext} from "../server/types";
import {FriendService} from "../services/friend.service";

export class ChatController implements Controller {

    constructor(private chatService: ChatService, private friendService: FriendService) { }

    handlers() {
        return {
            [Actions.NEW_PRIVATE_MESSAGE]: this.onPrivateMessage,
            [Actions.GET_PRIVATE_HISTORY]: this.onPrivateHistory,
            [Actions.DISCONNECT]: this.onDisconnect
        };
    }

    private onPrivateMessage = async (socket: SocketContext, message: MessageModel, ack: Function) => {
        const userId = socket.credentials.userId;
        try {
            await this.friendService.validateFriendship(message.to, userId, socket.credentials.token);
            const msg = new Message({ ...message, from: userId });
            const savedMsg = await msg.save();
            const targetId = this.chatService.getSocketId(savedMsg.to);
            ack(null, savedMsg);
            if (targetId) {
                socket.to(targetId).emit(Actions.SEND_PRIVATE_MESSAGE, savedMsg);
            }
        } catch (err) {
            ack(err.message);
            socket.disconnect();
        }
    };

     private onPrivateHistory = async (socket: SocketContext, target: string, ack: Function) => {
        const userId = socket.credentials.userId;
        try {
            await this.friendService.validateFriendship(target, userId, socket.credentials.token);
            const messages = await Message.find({
                $or: [{
                    $and: [{ from: userId }, { to: target }]
                }, {
                    $and: [{ from: target }, { to: userId }]
                }]
            });
            ack(null, messages);
        } catch (err) {
            ack(err.message);
            socket.disconnect();
        }
    };

    private onDisconnect = (socket: SocketContext) => {
        const userId = socket.credentials.userId;
        this.chatService.userLeft(userId);
        socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());
        console.log(`User ${userId} has left the server.`);
    };
}