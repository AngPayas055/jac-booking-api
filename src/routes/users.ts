import { forgotPasswordController, loginController, registerController, resetPasswordController, User } from "../models/User";
import { authenticateToken } from "../utils/middleware";
import express, { Request, Response } from 'express';

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

router.post('/', registerController)
router.post('/login', loginController)
router.post('/forgotpassword', forgotPasswordController)
router.post('/resetPassword', resetPasswordController)
router.get('/messages',authenticateToken, getUserPrompts)

module.exports = router;
