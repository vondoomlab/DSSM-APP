const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { getSystemPrompt } = require('../utils/systemPrompt');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async (req, res) => {
  const { question, conversationHistory = [] } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  // Use streaming so text appears word-by-word in the UI
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.flushHeaders();

  try {
    const messages = [
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: question }
    ];

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: getSystemPrompt('ask') + '\n\nFORMATTING RULE: Whenever your answer involves comparing multiple sites, stages, pathways, scores, timelines, or ranked lists — present that information as a markdown table. Use tables for: site comparisons, FCP score breakdowns, pathway feature comparisons, chronological sequences, and any multi-attribute data. Prose explanations should accompany but not replace tables where data is tabular in nature.',
      messages
    });

    // Stream each text chunk to the client as it arrives
    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    });

    const finalMessage = await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ done: true, tokens: finalMessage.usage?.input_tokens + finalMessage.usage?.output_tokens })}\n\n`);
    res.end();

  } catch (err) {
    console.error('Ask route error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
