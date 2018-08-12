import {User} from '../models/models';

export class ChatService {

    private users = new Map<string, User>();

    userJoined(userId: string, socketId: string) {
        this.users.set(userId, { socketId });
    }

    userLeft(userId: string) {
        this.users.delete(userId);
    }
}