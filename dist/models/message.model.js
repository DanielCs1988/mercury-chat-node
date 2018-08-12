"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number
    }
});
MessageSchema.pre('save', function (next) {
    const message = this;
    message.createdAt = new Date().getTime();
    next();
});
exports.Message = mongoose_1.model('Message', MessageSchema);
//# sourceMappingURL=message.model.js.map