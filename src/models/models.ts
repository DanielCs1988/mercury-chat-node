export const enum Actions {
    CONNECT = 'connection',
    DISCONNECT = 'disconnect',
    AUTHENTICATE = 'authenticate',
    NEW_PRIVATE_MESSAGE = 'private/send',
    GET_PRIVATE_HISTORY = 'private/history',
    SEND_PRIVATE_MESSAGE = 'private/receive'
}

export interface User {
    socketId: string;
}