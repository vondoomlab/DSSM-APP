const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { getSystemPrompt } = require('../utils/systemPrompt');

router.post('/', async (req, res) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { siteName, location, dateRange, observables } = req.body;

  if (!siteName) {
    return res.status(400).json({ error: 'Site name required.' });
  }

  const obsText = observables ? Object.entries(observables)
    .map(([key, val]) => `${key}: ${val}`).join('\n')
    : 'No observable descriptions provided — infer from site context.';

  const prompt = `Apply FCP 2D Scoring to this site:
SITE: ${siteName}
LOCATION: ${location || 'Not specified'}
DATE: ${dateRange || 'Not specified'}
OBSERVABLES:
${obsText}

## SITE CONTEXT
Brief paragraph on the site's cultural/temporal context and DSSM relevance.

## FCP 2D SCORES
Score each observable on E (Evidence Strength 0–2) and S (Symbolic Specificity 0–2). Use this exact markdown table format:
| Observable | E Score | S Score | E Rationale | S Rationale |
|-----------|--------|--------|-------------|-------------|
| O1: Pigment/Ochre | | | | |
| O2: Personal Ornaments | | | | |
| O3: Geometric Engravings | | | | |
| O4: Portable Symbolic Anchors | | | | |
| O5: Architecture/Space | | | | |
| O6: Standardization/Transmission | | | | |
| **TOTAL** | **/12** | **/12** | | |

Flag any zero scores with ⚠️. Apply MIN RULE: Final Score = min(Total_E, Total_S).

## SCORE SUMMARY
| Metric | Value |
|--------|-------|
| Total E | /12 |
| Total S | /12 |
| Final Score (MIN rule) | /12 |
| DSSM Stage implied | |
| Bottleneck axis | E or S |

## BENCHMARK COMPARISON
| Site | Score | Stage | Notes |
|------|-------|-------|-------|
| Omo Kibish | 2/12 | Stage 1 | Baseline anatomical modernity |
| Bruniquel Cave | 8/12 | Stage 2 | Neanderthal construction, low symbolic specificity |
| Blombos Cave | 12/12 | Stage 2→3 | Full FCP benchmark |
| ${siteName} | /12 | | |

## INTERPRETATION
What the score reveals about this site's position in the DSSM sequence, what the bottleneck axis tells us, and what evidence would raise the score.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: getSystemPrompt('score'),
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ answer: response.content[0]?.text || '' });
  } catch (err) {
    console.error('Score error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
