import * as jwks from "jwks-rsa";
import {verify} from "jsonwebtoken";
import {Socket} from "socket.io";
import {Actions} from "../models/models";
import {Authenticator} from "../server/types";
import {ChatService} from "../services/chat.service";

export class AuthGuard implements Authenticator {

    constructor(private chatService: ChatService) { }

     authenticate(socket: Socket): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            socket.on(Actions.AUTHENTICATE, async (token: string, ack: Function) => {
                try {
                    const userId = await this.getAuthIdFromToken(token);
                    ack();
                    this.userJoined(socket, userId);
                    resolve({ userId, token });
                } catch (error) {
                    ack(error);
                    socket.disconnect();
                    reject(error);
                }
            });
        });
    }

    private userJoined = (socket: Socket, userId: string) => {
        this.chatService.userJoined(userId, socket.id);
        socket.server.emit(Actions.SEND_USERLIST, this.chatService.getUserlist());
        console.log(`User ${userId} joined the server.`);
    };

    private readonly jwksClient = jwks({
        jwksUri: process.env.JWKS_URI!
    });

    private readonly options = {
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        algorithms: ['RS256']
    };

    private readonly keyResolver = (header: any, callback: Function) => {
        this.jwksClient.getSigningKey(header.kid, (err, key) => {
            if (!key) {
                callback('Could not decipher JWT claims!', null);
            } else {
                const signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
            }
        });
    };

    private readonly getAuthIdFromToken = (token: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            verify(token, this.keyResolver as any, this.options, (err, claims: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(claims.sub);
                }
            });
        });
    }
}