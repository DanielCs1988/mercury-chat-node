export const enum Actions {
    DISCONNECT = 'disconnect',
    AUTHENTICATE = 'authenticate',
    NEW_PRIVATE_MESSAGE = 'private/send',
    GET_PRIVATE_HISTORY = 'private/history',
    SEND_PRIVATE_MESSAGE = 'private/receive',
    SEND_USERLIST = 'users'
}

export interface User {
    socketId: string;
}