import mongoose, { Schema, Document } from 'mongoose';
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendCommonEmail, sendVerificationEmail } from '../services/email';

enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}

interface IUser extends Document {
  phone: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
  bookings: string[]; // Modify based on your app's booking model
  resetToken?: string;
  messages: mongoose.Types.ObjectId[]; 
  isVerified: boolean; 
  verificationToken?: string; 
}

const userSchema: Schema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'Booking', // Reference to the Booking model (modify based on your app's booking model name)
  }],
  resetToken: { type: String },
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message', // Reference to the Message model
  }],
  isVerified: {
    type: Boolean,
    default: false, // Default to false until verified
  },
  verificationToken: {
    type: String,
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export { User, UserRole, IUser };


const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

function generateToken(email) {
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign({ email: email }, secret, {
    expiresIn: "7d",
  });
  return token
}
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
}

export const registerController = async (req: Request, res: Response) => {
  try {
    const { phone, firstName, lastName, email, password } = req.body;

    if (!phone || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required', message: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format', message: 'Invalid email format'  });
    }

    if (phone.length < 6 || phone.length > 15) {
      return res.status(400).json({ error: 'Phone number must be between 6 and 15 characters', message: 'Phone number must be between 6 and 15 characters'  });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long', message: 'Password must be at least 6 characters long'  });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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

    const savedUser = await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "User registered successfully", data: email });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error', error: error });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try{
    const { email, password } = req.body;
    if ( !email || !password ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email: email })
    
    if (!user) {
      res.status(400).send({ message: "Incorrect email/password.", error: "Incorrect email/password." });
      return;
    }
    const isPasswordValid = await comparePassword(password, user.password);
    const userData = {
      token: generateToken(email),
      email: email,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user._id
    }

    if (isPasswordValid) {
      res.status(200).json({ message: "success", data: userData });
    } else {
      res.status(400).json({ message: "Incorrect email/password.", error: "Incorrect email/password." });
    }

  }catch(error){
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  try{
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const user = await User.findOne({ email: email })    
    if (!user) {
      res.status(400).json({ message: "Email not found", error: "Email not found" });
      return;
    }  
    const resetToken = await bcrypt.hash(email + Date.now().toString(), 10);
    user.resetToken = encodeURIComponent(resetToken)
    console.log()
    await user.save();
    let webAppLink = process.env.FRONTEND
    const resetLink = `${webAppLink}/forgot-password/${user.resetToken}`;
    const sendEmail = await sendCommonEmail([email], 'Reset Your Password', `Click the following link to reset your password: ${resetLink}`);
    if(sendEmail.MessageId){
      res.status(200).json({ message: "Reset email sent successfully." });
    } else{
      res.status(400).json({ message: "Send Email Error", error: "Send Email Error" });
    }
  }catch (error){
    res.status(500).json({ message: 'Internal server error', error: error });
  }
}

export const resetPasswordController = async (req:Request, res:Response) => {
  try{
    const { password, confirmPassword, resetToken } = req.body;
    if(password !== confirmPassword){
      return res.status(400).json({ message: "Password not match", error: "Password not match" });
    }
    const user = await User.findOne({ resetToken: resetToken })   
    if (!user) {
      return res.status(400).json({ message: "Invalid User", error: "Invalid User" });
    }  
    user.password = await bcrypt.hash(password, 10);
    await user.save();    
    res.status(200).json({ message: "Reset password sent successfully." });
  }catch(error){
    res.status(500).json({ message: 'Internal server error', error: error });
  }
}