import { forgotPasswordController, loginController, registerController, resetPasswordController, User } from "../models/User";
import { authenticateToken, authorizeAdmin } from "../utils/middleware";
import express, { Request, Response } from 'express';
import { Message } from "../models/Ai";

const express = require('express');
const router = express.Router();
console.log('users route loaded');


export const getUserPrompts = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).populate('messages').exec();    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userMessages = user.messages;
    res.status(200).json({ messages: userMessages });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const deleteUserPrompt = async (req: Request, res: Response) => {
  const userId = req.user.id; // Get the user ID from the request
  const { messageId } = req.params; // Get the message ID from the request parameters

  try {
    // Delete the message from the Message collection
    await Message.findByIdAndDelete(messageId);

    // Remove the message ID from the user's messages array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { messages: messageId } },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting user message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().exec(); // Retrieve all users
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ verificationToken: token });
    console.log('j',token,user)
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/', registerController)
router.post('/login', loginController)
router.post('/forgotpassword', forgotPasswordController)
router.post('/resetPassword', resetPasswordController)
router.get('/messages',authenticateToken, getUserPrompts)
router.delete('/messages/:messageId', authenticateToken, deleteUserPrompt);
router.get('/users', authenticateToken, authorizeAdmin, getAllUsers);
router.post('/verifyEmail', verifyEmail)

module.exports = router;
