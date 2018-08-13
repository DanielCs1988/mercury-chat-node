"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwks = require("jwks-rsa");
const jsonwebtoken_1 = require("jsonwebtoken");
const jwksClient = jwks({
    jwksUri: process.env.JWKS_URI
});
const options = {
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    algorithms: ['RS256']
};
const keyResolver = (header, callback) => jwksClient.getSigningKey(header.kid, (err, key) => {
    if (!key) {
        callback(null, null);
    }
    else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    }
});
function getAuthIdFromToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.verify(token, keyResolver, options, (err, claims) => {
            if (!claims) {
                reject('Could not decipher JWT claims!');
            }
            else {
                resolve(claims.sub);
            }
        });
    });
}
//# sourceMappingURL=authenticate.js.map