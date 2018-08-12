import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import {Actions} from "./models/models";
import {ChatController} from "./controllers/chat.controller";
import {connect} from "mongoose";
import {ChatService} from "./services/chat.service";

const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
connect(process.env.MONGODB_URI!, {useNewUrlParser: true});

const chatService = new ChatService();

io.on(Actions.CONNECT, (socket: socketIO.Socket) => {
    const controller = new ChatController(socket, chatService, '');
    controller.registerHandlers();
    console.log(`Client ${socket.id} connected.`);
});

server.listen(port, () => console.log(`Chat API listening on port ${port}...`));
