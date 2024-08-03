"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const middleware_1 = require("../utils/middleware");
const Ai_1 = require("../models/Ai");
const User_1 = require("../models/User");
const express = require('express');
const router = express.Router();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_KEY,
    dangerouslyAllowBrowser: true
});
const generateOpenAiMessage = (role, content) => __awaiter(void 0, void 0, void 0, function* () {
    return yield openai.chat.completions.create({
        messages: [{ role: role, content: content }],
        model: "gpt-3.5-turbo",
    });
});
const writeMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { language, textFormat, textSize, userMessage, withEmoji, writingStyle } = req.body;
    console.log('js', req.user.id);
    try {
        const prompt = `
      You are an AI assistant helping to draft messages and emails.

      Please create a ${textFormat} in ${language} with the following details:
      - The message should be ${textSize} in length.
      - The writing style should be ${writingStyle}.
      - ${withEmoji ? 'Use emojis as appropriate.' : 'Do not use emojis.'}

      User's message: "${userMessage}"

      Please write the ${textFormat} accordingly.
    `;
        const completion = yield generateOpenAiMessage('user', prompt);
        const generatedMessage = completion.choices[0].message.content;
        const newMessage = new Ai_1.Message({
            userMessage,
            generatedMessage,
            language,
            textFormat,
            textSize,
            writingStyle,
            withEmoji,
        });
        const savedMessage = yield newMessage.save();
        yield User_1.User.findByIdAndUpdate(req.user.id, {
            $push: { messages: savedMessage._id }
        });
        res.status(200).json({ message: "success", data: generatedMessage });
    }
    catch (error) {
        console.error('Error generating message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
function main(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { role, content } = req.body;
            if (!role || !content) {
                return res.status(400).json({ error: 'Role and content are required' });
            }
            const completion = yield generateOpenAiMessage(role, content);
            console.log(completion.choices[0]);
            res.status(200).json({ message: completion.choices[0].message });
        }
        catch (error) {
            console.error('Error generating completion:', error);
            let errorMessage = 'An unexpected error occurred';
            if (error.response) {
                console.error('Error response data:', error.response.data);
                errorMessage = ((_b = (_a = error.response.data) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.message) || errorMessage;
            }
            else if (error.request) {
                console.error('Error request:', error.request);
                errorMessage = 'No response received from the server';
            }
            else {
                console.error('Error message:', error.message);
                errorMessage = error.message;
            }
            res.status(500).json({ error: errorMessage });
        }
    });
}
router.post('/', middleware_1.authenticateToken, main);
router.post('/write', middleware_1.authenticateToken, writeMessage);
module.exports = router;
