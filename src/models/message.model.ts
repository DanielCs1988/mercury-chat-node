import {Document, model, Schema} from "mongoose";

export interface MessageModel extends Document {
    content: string;
    from: string;
    to: string;
    createdAt: number;
}

const MessageSchema = new Schema({
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
    const message = <MessageModel>this;
    message.createdAt = new Date().getTime();
    next();
});

export const Message = model<MessageModel>('Message', MessageSchema);