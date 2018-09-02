import {User} from '../models/models';
import {FriendService} from "./friend.service";

export class ChatService {

    private users = new Map<string, User>();

    constructor(private friendService: FriendService) { }

    getSocketId(userId: string): string | null {
        const user = this.users.get(userId);
        return user ? user.socketId : null;
    }

    getUserlist(): string[] {
        return [...this.users.keys()];
    }

    userJoined(userId: string, socketId: string) {
        this.users.set(userId, { socketId });
    }

    userLeft(userId: string) {
        this.users.delete(userId);
        this.friendService.clearFriendlist(userId);
    }
}