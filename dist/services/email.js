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
exports.sendMail = exports.sendGmail = exports.sendCommonEmail = void 0;
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");
const sendCommonEmail = (to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporterCommon = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.APP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const commonMailOptions = {
            from: {
                name: 'Jac booking',
                address: process.env.USER
            },
            to: to,
            subject: subject,
            text: body,
            html: "",
        };
        yield transporterCommon.sendMail(commonMailOptions);
        console.log('Email has been sent!');
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
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendGmail = sendGmail;
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});
const mailOptions = {
    from: {
        name: 'Jac booking',
        address: process.env.USER
    },
    to: ["jhonreymendiola@gmail.com"],
    subject: "Hello ✔",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
};
const sendMail = (transporter, mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail(mailOptions);
        console.log('Email has been sent!');
    }
    catch (error) {
        console.error(error);
    }
});
exports.sendMail = sendMail;
