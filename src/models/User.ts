import mongoose, { Schema, Document } from 'mongoose';
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';

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
});

const User = mongoose.model<IUser>('User', userSchema);

export { User, UserRole };


// Register endpoint
export const registerController = async (req: Request, res: Response) => {
  try {
    const { phone, firstName, lastName, email, password } = req.body;
    
    if (!phone || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
};
