import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import {Actions} from "./models/models";
import {ChatController} from "./controllers/chat.controller";
import {connect} from "mongoose";
import {ChatService} from "./services/chat.service";
import {Authenticator} from "./middleware/authenticator";

const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
connect(process.env.MONGODB_URI!, {useNewUrlParser: true});

const chatService = new ChatService();
const authenticator = new Authenticator();

const setupControllers = (err: string, socket: socketIO.Socket, userId: string, token: string) => {
    if (!err) {
        const controller = new ChatController(socket, chatService, userId, token);
        controller.registerHandlers();
        console.log(`Client ${userId} connected.`);
    } else {
        console.log(err);
    }
};

io.on(Actions.CONNECT, (socket: socketIO.Socket) => {
    authenticator.authenticate(socket, setupControllers);
});

server.listen(port, () => console.log(`Chat API listening on port ${port}...`));
