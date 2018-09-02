import axios from 'axios';

export class FriendService {

    private readonly USER_API_URL = 'https://mercury-feed.herokuapp.com/friendlist';
    private readonly friendlists = new Map<string, Set<string>>();

    validateFriendship = async (target: string, currentUser: string, token: string): Promise<void> => {
        if (target === currentUser) { return; }
        if (!this.friendlists.has(currentUser)) {
            await this.fetchFriendlist(token, currentUser);
        }
        // Optimistic approach: updating the friendlist once if the target user is not found on it.
        // It might have changed in the meantime.
        // TODO: React real-time to when someone else removes this user's friendship.
        if (!this.friendlists.get(currentUser)!.has(target)) {
            await this.fetchFriendlist(token, currentUser);
        }
        if (this.friendlists.get(currentUser)!.has(target)) {
            return;
        }
        throw 'UNAUTHORIZED: Target is not the friend of current user!';
    };

    clearFriendlist = (userId: string) => {
        this.friendlists.delete(userId);
    };

    private fetchFriendlist = async (token: string, currentUser: string) => {
        const friendlist = await axios.get(this.USER_API_URL, {headers: {'Authorization': `Bearer ${token}`}});
        this.friendlists.set(currentUser, new Set<string>(friendlist.data));
    };
}