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
exports.sendVerificationEmail = exports.sendGmail = exports.sendCommonEmail = void 0;
require("dotenv").config();
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const AWS = require('aws-sdk');
const SES_CONFIG = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
};
const AWS_SES = new AWS.SES(SES_CONFIG);
const sendCommonEmail = (to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    let params = {
        Source: process.env.SENDER,
        Destination: {
            ToAddresses: to
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: body
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        }
    };
    try {
        const res = yield AWS_SES.sendEmail(params).promise();
        console.log('Email has been sent!', res);
        return res;
    }
    catch (error) {
        console.error(error);
        return error;
    }
});
exports.sendCommonEmail = sendCommonEmail;
const sendGmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { to, subject, body } = req.body;
        (0, exports.sendCommonEmail)(to, subject, body);
        res.status(201).json({ message: "email sent" });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', err: error });
    }
});
exports.sendGmail = sendGmail;
const sendVerificationEmail = (userEmail, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationLink = `${process.env.FRONTEND}/verify-email?token=${token}`;
    const subject = 'Verify Your Email Address';
    const body = `
    <h1>Email Verification</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
    try {
        yield (0, exports.sendCommonEmail)([userEmail], subject, body);
        console.log('Verification email sent');
    }
    catch (error) {
        console.error('Failed to send verification email', error);
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
