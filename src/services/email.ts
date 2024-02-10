import express, { Request, Response } from 'express';
const nodemailer = require("nodemailer")
const AWS = require('aws-sdk'); 
require("dotenv").config();
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const path = require("path")

const SES_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION
}

const AWS_SES = new AWS.SES(SES_CONFIG);

const sendEmail = async (recipientEmail, name) => {
  let params = {
    Source: process.env.SENDER,
    Destination: {
      ToAddresses: [
        recipientEmail
      ]
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: '<h1>this is the body html</h1>'
        },
        Text: {
          Charset: 'UTF-8',
          Data: 'this is the text'
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Hello, ${name}`
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

// sendEmail("lvl99tommy@gmail.com", "web wizard")

export const sendCommonEmail = async ( to: string[], subject: string, body:string ) => {
  
sendEmail("lvl99tommy@gmail.com", "web wizard")
return
  try{
    const transporterCommon = nodemailer.createTransport({
      host: "email-smtp.ap-southeast-1.amazonaws.com",
      port: 587,
      secure: false,
      auth: {
        user: "AKIAV3PINWXEKV4EDFVS", //process.env.USER,
        pass: "BFSdD5qsvDvj0MmpdtF0MLlGbqsiQSDG/HHRIq4bT9LI"//process.env.APP_PASSWORD,
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
    }
    await transporterCommon.sendMail(commonMailOptions);
    console.log('Email has been sent!')

  }catch(error){
    console.error(error)
  }
}

export const sendGmail = async (req: Request, res: Response) => {
  try{
    const { to, subject, body } = req.body
    sendCommonEmail(to, subject, body)
    res.status(201).json({message: "email sent"});
  }catch(error){
    res.status(500).json({ error: 'Internal server error' });
  }
}




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
  to: ["jhonreymendiola@gmail.com"], // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world?", // plain text body
  html: "<b>Hello world?</b>", // html body
  // attachments: [{
  //   filename: "test.pdf",
  //   path: path.join(__dirname, 'test.pdf'),//add a pdf file
  //   contentType: 'application/pdf'
  // },
  // {
  //   filename: "sample.jpg",
  //   path: path.join(__dirname, 'sample.jpg'),//add an image
  //   contentType: 'imgae/jpg'
  // }]
}

export const sendMail = async (transporter, mailOptions) => {
  try{
    await transporter.sendMail(mailOptions);
    console.log('Email has been sent!')
  }catch (error) {
    console.error(error)
  }
}