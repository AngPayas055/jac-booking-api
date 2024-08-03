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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.deleteUserPrompt = exports.getUserPrompts = void 0;
const User_1 = require("../models/User");
const middleware_1 = require("../utils/middleware");
const Ai_1 = require("../models/Ai");
const express = require('express');
const router = express.Router();
console.log('users route loaded');
const getUserPrompts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const user = yield User_1.User.findById(userId).populate('messages').exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userMessages = user.messages;
        res.status(200).json({ messages: userMessages });
    }
    catch (error) {
        console.error('Error fetching user messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUserPrompts = getUserPrompts;
const deleteUserPrompt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { messageId } = req.params;
    try {
        yield Ai_1.Message.findByIdAndDelete(messageId);
        yield User_1.User.findByIdAndUpdate(userId, { $pull: { messages: messageId } }, { new: true });
        res.status(200).json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteUserPrompt = deleteUserPrompt;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find().exec();
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAllUsers = getAllUsers;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        const user = yield User_1.User.findOne({ verificationToken: token });
        console.log('j', token, user);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        yield user.save();
        res.status(200).json({ message: 'Email verified successfully!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', User_1.registerController);
router.post('/login', User_1.loginController);
router.post('/forgotpassword', User_1.forgotPasswordController);
router.post('/resetPassword', User_1.resetPasswordController);
router.get('/messages', middleware_1.authenticateToken, exports.getUserPrompts);
router.delete('/messages/:messageId', middleware_1.authenticateToken, exports.deleteUserPrompt);
router.get('/users', middleware_1.authenticateToken, middleware_1.authorizeAdmin, exports.getAllUsers);
router.post('/verifyEmail', verifyEmail);
module.exports = router;
