import {ChatController} from "./controllers/chat.controller";
import {connect} from "mongoose";
import {ChatService} from "./services/chat.service";
import {AuthGuard} from "./middleware/authenticator";
import {SocketServer} from "./server/socket-server";
import {FriendService} from "./services/friend.service";

connect(process.env.MONGODB_URI!, {useNewUrlParser: true});

const friendService = new FriendService();
const chatService = new ChatService(friendService);
const authenticator = new AuthGuard(chatService);
const chatController = new ChatController(chatService, friendService);

const server = new SocketServer(
    [ chatController ],
    process.env.PORT || 8080,
    authenticator
);

server.listen();