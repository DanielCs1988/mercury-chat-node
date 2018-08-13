"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwks = require("jwks-rsa");
const jsonwebtoken_1 = require("jsonwebtoken");
class Authenticator {
    constructor() {
        this.jwksClient = jwks({
            jwksUri: process.env.JWKS_URI
        });
        this.options = {
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
            algorithms: ['RS256']
        };
        this.keyResolver = (header, callback) => {
            this.jwksClient.getSigningKey(header.kid, (err, key) => {
                if (!key) {
                    callback('Could not decipher JWT claims!', null);
                }
                else {
                    const signingKey = key.publicKey || key.rsaPublicKey;
                    callback(null, signingKey);
                }
            });
        };
        this.getAuthIdFromToken = (token) => {
            return new Promise((resolve, reject) => {
                jsonwebtoken_1.verify(token, this.keyResolver, this.options, (err, claims) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(claims.sub);
                    }
                });
            });
        };
    }
    authenticate(socket, callback) {
        socket.on("authenticate" /* AUTHENTICATE */, (token, ack) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = yield this.getAuthIdFromToken(token);
                callback(null, socket, userId, token);
                ack();
            }
            catch (err) {
                ack(err);
                socket.disconnect();
                callback(`Unauthorized: ${err}`);
            }
        }));
    }
}
exports.Authenticator = Authenticator;
//# sourceMappingURL=authenticator.js.map