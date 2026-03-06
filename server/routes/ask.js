const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { getSystemPrompt } = require('../utils/systemPrompt');

router.post('/', async (req, res) => {
  const { question, conversationHistory = [] } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const messages = [
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: question }
    ];

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: getSystemPrompt('ask') + '\n\nFORMATTING RULE: Whenever your answer involves comparing multiple sites, stages, pathways, scores, timelines, or ranked lists — present that information as a markdown table.',
      messages
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullText += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ chunk: chunk.delta.text })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true, full: fullText })}\n\n`);
    res.end();

  } catch (err) {
    console.error('Ask route error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
