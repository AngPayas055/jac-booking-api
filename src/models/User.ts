import mongoose, { Schema, Document } from 'mongoose';
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { sendCommonEmail } from '../services/email';

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

export const registerController = async (req: Request, res: Response) => {
  console.log('login log')
  try {
    const { phone, firstName, lastName, email, password } = req.body;

    if (!phone || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (phone.length < 6 || phone.length > 15) {
      return res.status(400).json({ error: 'Phone number must be between 6 and 15 characters' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phone,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER, //default role
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
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

    if (isPasswordValid) {
      res.status(200).json({ message: "Login successful", token: generateToken(email) });
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
      res.status(400).send({ message: "Email not found", error: "Email not found" });
      return;
    }  
    const resetToken = await bcrypt.hash(email + Date.now().toString(), 10);
    user.resetToken = resetToken;
    await user.save();
    const resetLink = `http://yourwebsite.com/reset-password/${resetToken}`;
    await sendCommonEmail([email], 'Reset Your Password', `Click the following link to reset your password: ${resetLink}`);

    res.status(200).json({ message: "Reset email sent successfully." });
  }catch (error){
    res.status(500).json({ message: 'Internal server error', error: error });
  }
}