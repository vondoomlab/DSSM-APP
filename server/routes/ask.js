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

  try {
    const messages = [
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: question }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: getSystemPrompt('ask') + '\n\nFORMATTING RULE: Whenever your answer involves comparing multiple sites, stages, pathways, scores, timelines, or ranked lists — present that information as a markdown table.',
      messages
    });

    res.json({ answer: response.content[0]?.text || '' });

  } catch (err) {
    console.error('Ask route error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
