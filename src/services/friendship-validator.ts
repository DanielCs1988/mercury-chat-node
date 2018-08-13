import axios from 'axios';

const USER_API_URL = 'https://protected-island-21893.herokuapp.com/friendlist';
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

async function friendshipIsValid(target: string, currentUser: string, token: string): Promise<boolean> {
    if (target === currentUser) { return true; }
    if (!friendlists.has(currentUser)) {
        const friendlist = await axios.get(USER_API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
        friendlists.set(currentUser, new Set<string>(friendlist.data));
    }
    console.log('Friendlist:', friendlists.get(currentUser));
    return friendlists.get(currentUser)!.has(target);
}