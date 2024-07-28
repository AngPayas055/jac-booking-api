import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

require("dotenv").config();
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const AWS = require('aws-sdk'); 

const SES_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION
}

const AWS_SES = new AWS.SES(SES_CONFIG);

export const sendCommonEmail = async ( to: string[], subject: string, body:string ) => {  
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
        // Text: {
        //   Charset: 'UTF-8',
        //   Data: body
        // }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    }
  }
  try{
    const res = await AWS_SES.sendEmail(params).promise();
    console.log('Email has been sent!', res)
    return res
  } catch (error) {
    console.error(error)
    return error
  }
}

export const sendGmail = async (req: Request, res: Response) => {
  try{
    const { to, subject, body } = req.body
    sendCommonEmail(to, subject, body)
    res.status(201).json({message: "email sent"});
  }catch(error){
    res.status(500).json({ message: 'Internal server error', err: error });
  }
}
export const sendVerificationEmail = async (userEmail: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND}/verify-email?token=${token}`;
  const subject = 'Verify Your Email Address';
  const body = `
    <h1>Email Verification</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  try {
    await sendCommonEmail([userEmail], subject, body);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Failed to send verification email', error);
  }
};

