import OpenAI from "openai";
const express = require('express');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  dangerouslyAllowBrowser: true
});

async function main(req:any, res:any) {
  const { content } = req.body;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: content }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  res.status(200).json({ message: completion.choices[0] })
}

// main();

router.post('/', main)

module.exports = router;