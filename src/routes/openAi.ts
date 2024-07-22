import OpenAI from "openai";
import { authenticateToken } from "../utils/middleware";
import { Role } from "../interface/opnai";
import express, { Request, Response } from 'express';
import { Message } from "../models/Ai";
import { User } from "../models/User";

const express = require('express');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  dangerouslyAllowBrowser: true
});

const generateOpenAiMessage = async (role:Role, content: string) => {
  return await openai.chat.completions.create({
      messages: [{ role: role, content: content }],
      model: "gpt-3.5-turbo",
    });
}

const writeMessage = async (req: Request, res: Response) => {
  const { language, textFormat, textSize, userMessage, withEmoji, writingStyle } = req.body;
  console.log('js',req.user.id)
  try {
    const prompt = `
      You are an AI assistant helping to draft messages and emails.

      Please create a ${textFormat} in ${language} with the following details:
      - The message should be ${textSize} in length.
      - The writing style should be ${writingStyle}.
      - ${withEmoji ? 'Use emojis as appropriate.' : 'Do not use emojis.'}

      User's message: "${userMessage}"

      Please write the ${textFormat} accordingly.
    `;
    const completion = await generateOpenAiMessage('user', prompt);
    const generatedMessage = completion.choices[0].message.content;

    // Save the generated message to the database
    const newMessage = new Message({
      userMessage,
      generatedMessage,
      language,
      textFormat,
      textSize,
      writingStyle,
      withEmoji,
    });

    const savedMessage = await newMessage.save();

    // Update the user's document with the new message ID
    await User.findByIdAndUpdate(req.user.id, {
      $push: { messages: savedMessage._id }
    });

    // Send the response back to the client
    res.status(200).json({ message: "success", data: generatedMessage });
  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function main(req: any, res: any) {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }
    const completion = await generateOpenAiMessage(role, content)
    console.log(completion.choices[0]);
    res.status(200).json({ message: completion.choices[0].message });
  } catch (error: any) {
    console.error('Error generating completion:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      console.error('Error response data:', error.response.data);
      errorMessage = error.response.data?.error?.message || errorMessage;
    } else if (error.request) {
      console.error('Error request:', error.request);
      errorMessage = 'No response received from the server';
    } else {
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
}

router.post('/', authenticateToken, main)
router.post('/write', authenticateToken, writeMessage)

module.exports = router;