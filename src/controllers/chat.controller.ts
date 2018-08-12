import {Socket} from "socket.io";
import {ChatService} from "../services/chat.service";
import {Actions} from "../models/models";

export class ChatController {

    constructor(private socket: Socket, private chatService: ChatService, private userId: string) {
        chatService.userJoined(userId, socket.id);
    }

    registerHandlers() {
        // setup handlers here
        this.socket.on(Actions.DISCONNECT, () => {
            this.chatService.userLeft(this.userId);
            console.log(`User ${this.socket.id} has left the server.`);
        });
    }
}