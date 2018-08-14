import axios from 'axios';

const USER_API_URL = 'https://mercury-feed.herokuapp.com/friendlist';
const friendlists = new Map<string, Set<string>>();

export function validateFriendship(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function(...args: any[]) {
        try {
            const target = typeof args[0] === 'string' ? args[0] : args[0].to;
            // @ts-ignore
            if (await friendshipIsValid(target, this.userId, this.token)) {
                return original.apply(this, args);
            }
            // @ts-ignore
            this.socket.disconnect();
        } catch (e) {
            console.log('Error:', e);
            throw e;
        }
    };
    return descriptor;
}

async function fetchFriendlist(token: string, currentUser: string) {
    const friendlist = await axios.get(USER_API_URL, {headers: {'Authorization': `Bearer ${token}`}});
    friendlists.set(currentUser, new Set<string>(friendlist.data));
}

async function friendshipIsValid(target: string, currentUser: string, token: string): Promise<boolean> {
    if (target === currentUser) { return true; }
    if (!friendlists.has(currentUser)) {
        await fetchFriendlist(token, currentUser);
    }
    // Optimistic approach: updating the friendlist once if the target user is not found on it.
    // It might have changed in the meantime.
    // TODO: React real-time to when someone else removes this user's friendship.
    if (!friendlists.get(currentUser)!.has(target)) {
        await fetchFriendlist(token, currentUser);
    }
    return friendlists.get(currentUser)!.has(target);
}

export function clearFriendlist(userId: string) {
    friendlists.delete(userId);
}