"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const messageSchema = new mongoose_1.Schema({
    userMessage: {
        type: String,
        required: true,
    },
    generatedMessage: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ['filipino', 'english-us', 'english-uk'],
        required: true,
    },
    textFormat: {
        type: String,
        enum: ['Email', 'Message'],
        required: true,
    },
    textSize: {
        type: String,
        enum: ['Short', 'Medium', 'Long'],
        required: true,
    },
    writingStyle: {
        type: String,
        enum: [
            'Formal', 'Friendly', 'Persuasive', 'Expert', 'Joyful', 'Inspirational',
            'Informative', 'Thoughtful', 'Cautionary', 'Grieved', 'Exciting', 'Loving',
            'Confident', 'Surprised', 'Brutal'
        ],
        required: true,
    },
    withEmoji: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.Message = Message;
