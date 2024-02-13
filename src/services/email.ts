import express, { Request, Response } from 'express';

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
        // Html: {
        //   Charset: 'UTF-8',
        //   Data: '<h1>this is the body html</h1>'
        // },
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
  }
  try{
    const res = await AWS_SES.sendEmail(params).promise();
    console.log('Email has been sent!', res)
  } catch (error) {
    console.error(error)
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
