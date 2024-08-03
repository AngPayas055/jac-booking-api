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
exports.authorizeAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
require('dotenv').config();
const MY_ACCOUNT_ID = process.env.MY_ACCOUNT_ID;
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.status(401).json({ message: 'Unauthorized' });
    const resp = yield verifyJWT(token);
    if (!resp.success) {
        res.status(403).send({ error: "Session Expired" });
        return;
    }
    else {
        req.user = resp.user;
        next();
    }
});
exports.authenticateToken = authenticateToken;
const verifyJWT = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (err || response === undefined) {
                    resolve({
                        success: false
                    });
                }
                const user = yield User_1.User.findOne({ email: response.email });
                if (!user) {
                    resolve({
                        success: false
                    });
                    return;
                }
                resolve({
                    success: true,
                    user: {
                        id: user._id,
                        email: user.email
                    }
                });
            }
            catch (ex) {
                resolve({
                    success: false
                });
            }
        }));
    });
});
const authorizeAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id.toString();
    if (userId !== MY_ACCOUNT_ID) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this resource' });
    }
    next();
});
exports.authorizeAdmin = authorizeAdmin;
