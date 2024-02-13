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
exports.sendGmail = exports.sendCommonEmail = void 0;
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
                Text: {
                    Charset: 'UTF-8',
                    Data: body
                }
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
    }
    catch (error) {
        console.error(error);
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
