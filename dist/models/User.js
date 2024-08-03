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
exports.resetPasswordController = exports.forgotPasswordController = exports.loginController = exports.registerController = exports.UserRole = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../services/email");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["CUSTOMER"] = "customer";
    UserRole["DRIVER"] = "driver";
})(UserRole || (exports.UserRole = UserRole = {}));
const userSchema = new mongoose_1.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.CUSTOMER,
    },
    bookings: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Booking',
        }],
    resetToken: { type: String },
    messages: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Message',
        }],
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
});
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hashedPassword);
});
function generateToken(email) {
    const secret = process.env.JWT_SECRET;
    const token = jsonwebtoken_1.default.sign({ email: email }, secret, {
        expiresIn: "7d",
    });
    return token;
}
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
const registerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, firstName, lastName, email, password } = req.body;
        if (!phone || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required', message: 'All fields are required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format', message: 'Invalid email format' });
        }
        if (phone.length < 6 || phone.length > 15) {
            return res.status(400).json({ error: 'Phone number must be between 6 and 15 characters', message: 'Phone number must be between 6 and 15 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long', message: 'Password must be at least 6 characters long' });
        }
        const existingUser = yield User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const newUser = new User({
            phone,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: UserRole.CUSTOMER,
            isVerified: false,
            verificationToken,
        });
        const savedUser = yield newUser.save();
        yield (0, email_1.sendVerificationEmail)(email, verificationToken);
        res.status(201).json({ message: "User registered successfully", data: email });
    }
    catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Internal server error', error: error });
    }
});
exports.registerController = registerController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const user = yield User.findOne({ email: email });
        if (!user) {
            res.status(400).send({ message: "Incorrect email/password.", error: "Incorrect email/password." });
            return;
        }
        if (!user.isVerified == true) {
            res.status(400).send({
                message: "Your account has not been verified. Please check your email for the verification link and verify your account before logging in.",
                error: "Your account has not been verified. Please check your email for the verification link and verify your account before logging in."
            });
            return;
        }
        const isPasswordValid = yield comparePassword(password, user.password);
        const userData = {
            token: generateToken(email),
            email: email,
            firstName: user.firstName,
            lastName: user.lastName,
            id: user._id
        };
        if (isPasswordValid) {
            res.status(200).json({ message: "success", data: userData });
        }
        else {
            res.status(400).json({ message: "Incorrect email/password.", error: "Incorrect email/password." });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.loginController = loginController;
const forgotPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        const user = yield User.findOne({ email: email });
        if (!user) {
            res.status(400).json({ message: "Email not found", error: "Email not found" });
            return;
        }
        const resetToken = yield bcrypt_1.default.hash(email + Date.now().toString(), 10);
        user.resetToken = encodeURIComponent(resetToken);
        console.log();
        yield user.save();
        let webAppLink = process.env.FRONTEND;
        const resetLink = `${webAppLink}/forgot-password/${user.resetToken}`;
        const sendEmail = yield (0, email_1.sendCommonEmail)([email], 'Reset Your Password', `Click the following link to reset your password: ${resetLink}`);
        if (sendEmail.MessageId) {
            res.status(200).json({ message: "Reset email sent successfully." });
        }
        else {
            res.status(400).json({ message: "Send Email Error", error: "Send Email Error" });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error });
    }
});
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, confirmPassword, resetToken } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password not match", error: "Password not match" });
        }
        const user = yield User.findOne({ resetToken: resetToken });
        if (!user) {
            return res.status(400).json({ message: "Invalid User", error: "Invalid User" });
        }
        user.password = yield bcrypt_1.default.hash(password, 10);
        yield user.save();
        res.status(200).json({ message: "Reset password sent successfully." });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error });
    }
});
exports.resetPasswordController = resetPasswordController;
