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
const axios_1 = require("axios");
const USER_API_URL = 'https://protected-island-21893.herokuapp.com/friendlist';
const friendlists = new Map();
function validateFriendship(target, propertyKey, descriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const target = typeof args[0] === 'string' ? args[0] : args[0].to;
                // @ts-ignore
                if (yield friendshipIsValid(target, this.userId, this.token)) {
                    return original.apply(this, args);
                }
                // @ts-ignore
                this.socket.disconnect();
            }
            catch (e) {
                console.log('Error:', e);
                throw e;
            }
        });
    };
    return descriptor;
}
exports.validateFriendship = validateFriendship;
function friendshipIsValid(target, currentUser, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (target === currentUser) {
            return true;
        }
        if (!friendlists.has(currentUser)) {
            const friendlist = yield axios_1.default.get(USER_API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
            friendlists.set(currentUser, new Set(friendlist.data));
        }
        console.log('Friendlist:', friendlists.get(currentUser));
        return friendlists.get(currentUser).has(target);
    });
}
//# sourceMappingURL=friendship-validator.js.map