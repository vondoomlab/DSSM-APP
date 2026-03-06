const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { getSystemPrompt } = require('../utils/systemPrompt');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async (req, res) => {
  const { siteName, location, dateRange, evidence } = req.body;

  if (!siteName || !evidence) {
    return res.status(400).json({ error: 'Site name and evidence description required.' });
  }

  const prompt = `Classify this archaeological site using the DSSM framework:
SITE: ${siteName}
LOCATION: ${location || 'Not specified'}
DATE: ${dateRange || 'Not specified'}
EVIDENCE: ${evidence}

Structure your response with the following sections and use markdown tables wherever data is comparative or multi-dimensional:

## DSSM CLASSIFICATION
State the primary DSSM Stage (1–4) and stabilization pathway. If the site is transitional, identify both stages.

## FCP 2D SCORE ESTIMATE
Produce a full markdown table for all 6 observables:
| Observable | Evidence Present | E Score (0–2) | S Score (0–2) | Notes |
|-----------|-----------------|--------------|--------------|-------|
Then show: Total_E, Total_S, Final Score (MIN rule), implied DSSM stage.

## BENCHMARK COMPARISON
| Site | FCP Score | DSSM Stage | Similarity to ${siteName} |
|------|----------|-----------|--------------------------|
Include: Omo Kibish (2/12), Bruniquel Cave (8/12), Blombos Cave (12/12), and ${siteName}.

## EVIDENCE ASSESSMENT
Table of supporting vs missing evidence:
| Observable | Status | Evidence Detail | Confidence |
|-----------|--------|----------------|-----------|

## NEXT PREDICTED SIGNATURES
Table of what to look for next in excavation:
| Priority | Signature | Location Hint | DSSM Implication |
|---------|-----------|--------------|-----------------|

## CONFIDENCE & GAPS
Overall confidence level with key uncertainties listed.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: getSystemPrompt('classify'),
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ answer: response.content[0]?.text || '' });
  } catch (err) {
    console.error('Classify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
