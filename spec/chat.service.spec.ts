import {ChatService} from "../src/services/chat.service";

describe('Chat Service', () => {

    let chatService: ChatService;

    beforeEach(() => {
        chatService = new ChatService();
        chatService.userJoined('userId1', 'socketId1');
        chatService.userJoined('userId2', 'socketId2');
    });

    it('should fetch the proper user ids', () => {
        const result = chatService.getUserlist();
        const expected = ['userId1', 'userId2'];
        expect(result).toEqual(expected);
    });

    it('should return the correct socketId for a user', () => {
        const result = chatService.getSocketId('userId2');
        expect(result).toBe('socketId2');
    });

    it('should return null for a non-existing user', () => {
        const result = chatService.getSocketId('Laci');
        expect(result).toBeNull();
    });

    it('should remove users', () => {
        chatService.userLeft('userId1');
        const result = chatService.getUserlist();
        const expected = ['userId2'];
        expect(result).toEqual(expected);
    });

    it('should add new users', () => {
        chatService.userJoined('newGuy', 'newSocks');
        const result = chatService.getSocketId('newGuy');
        expect(result).toBe('newSocks');
    });
});