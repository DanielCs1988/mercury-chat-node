import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import {Authenticator, Controller, SocketContext} from "./types";
import {Socket} from "socket.io";

export class SocketServer {

    private readonly server: http.Server;
    private readonly io: socketIO.Server;
    readonly app: express.Application;

    constructor(
        private readonly controllers: Controller[],
        private readonly port: number | string,
        private readonly authenticator?: Authenticator
    ) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server);
        this.io.on('connection', this.authenticateIfNeeded);
    }

    private authenticateIfNeeded = async (socket: Socket) => {
        if (this.authenticator) {
            try {
                const credentials = await this.authenticator.authenticate(socket);
                this.registerHandlers(socket, credentials);
            } catch (err) {
                console.log('Unauthorized connection attempt:', err.message);
            }
        } else {
            this.registerHandlers(socket);
        }
    };

    private registerHandlers = (socket: SocketContext, credentials?: any) => {
        if (credentials) {
            socket.credentials = credentials;
        }
        for (const controller of this.controllers) {
            const mapping = controller.handlers();
            for (const route in mapping) {
                socket.on(route, (...args: any[]) => {
                    mapping[route](socket, ...args);
                });
            }
        }
    };

    listen = () => {
        this.server.listen(this.port, () => console.log(`Chat API listening on port ${this.port}...`));
    }
}