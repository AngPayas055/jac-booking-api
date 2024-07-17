import OpenAI from "openai";
import { authenticateToken } from "../utils/middleware";
const express = require('express');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  dangerouslyAllowBrowser: true
});

async function main(req: any, res: any) {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }
    const completion = await openai.chat.completions.create({
      messages: [{ role: role, content: content }],
      model: "gpt-3.5-turbo",
    });
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

module.exports = router;