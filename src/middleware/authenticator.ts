import * as jwks from "jwks-rsa";
import {verify} from "jsonwebtoken";
import {Socket} from "socket.io";
import {Actions} from "../models/models";

export class Authenticator {

     authenticate(socket: Socket, callback: authCallbackFn) {
        socket.on(Actions.AUTHENTICATE, async (token: string, ack: Function) => {
            try {
                const userId = await this.getAuthIdFromToken(token);
                callback(null, socket, userId, token);
                ack();
            } catch (err) {
                ack(err);
                socket.disconnect();
                callback(`Unauthorized: ${err}`);
            }
        });
    }

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

export type authCallbackFn = (err: string | null, socket?: Socket, userId?: string, token?: string) => void;