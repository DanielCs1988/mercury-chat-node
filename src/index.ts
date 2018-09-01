import {ChatController} from "./controllers/chat.controller";
import {connect} from "mongoose";
import {ChatService} from "./services/chat.service";
import {AuthGuard} from "./middleware/authenticator";
import {SocketServer} from "./server/socket-server";

connect(process.env.MONGODB_URI!, {useNewUrlParser: true});

const chatService = new ChatService();
const authenticator = new AuthGuard(chatService);
const chatController = new ChatController(chatService);

const server = new SocketServer(
    [ chatController ],
    process.env.PORT || 8080,
    authenticator
);

server.listen();