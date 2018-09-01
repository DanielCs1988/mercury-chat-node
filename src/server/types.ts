import {Socket} from "socket.io";

export interface SocketContext extends Socket {
    credentials?: any;
}

export type HandlerMapping = { [event: string]: (socket: SocketContext, ...args: any[]) => void };

export interface Controller {
    handlers(): HandlerMapping;
}

export interface Authenticator {
    authenticate(socket: Socket): Promise<any>;
}
