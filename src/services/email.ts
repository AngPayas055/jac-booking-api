import express, { Request, Response } from 'express';
const nodemailer = require("nodemailer")
require("dotenv").config();
const path = require("path")

export const sendCommonEmail = async ( to: string[], subject: string, body:string ) => {
  try{
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