const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { getSystemPrompt } = require('../utils/systemPrompt');

router.post('/', async (req, res) => {
  const { region, lat, lng, radius_km = 50, known_sites = [], satellite_observations = [], target_stage } = req.body;

  if (!region && (!lat || !lng)) {
    return res.status(400).json({ error: 'Region name or coordinates required.' });
  }

  const locationStr = lat && lng ? `${lat}°, ${lng}° (radius: ${radius_km}km)` : region;
  const knownSitesStr = known_sites.length > 0
    ? known_sites.map(s => `- ${s.name} (${s.period || '?'}, stage ${s.stage || '?'})`).join('\n')
    : 'None provided';
  const satObsStr = satellite_observations.length > 0
    ? satellite_observations.map(o => `- ${o.type}: ${o.description}`).join('\n')
    : 'None provided';

  const prompt = `DSSM excavation zone predictions for: ${locationStr}
Target stage: ${target_stage || 'Any'}
Known sites: ${knownSitesStr}
Satellite observations: ${satObsStr}

Be concise. Use markdown tables throughout. Complete ALL sections in order.

## 1. EXCAVATION ZONES SUMMARY
| Zone ID | Priority | Coordinates | Stage Expected | DSSM Pathway | Key Satellite Signature |
|---------|----------|-------------|---------------|--------------|------------------------|

## 2. REGIONAL PATHWAY ANALYSIS
| Pathway | Fit | Key Evidence For | Key Evidence Against |
|---------|-----|-----------------|---------------------|

## 3. CHRONOLOGICAL SEQUENCE
| Layer | Approx. Date | DSSM Stage | Diagnostic Markers |
|-------|-------------|-----------|-------------------|

## 4. SATELLITE ACQUISITION STRATEGY
| Priority | Dataset | Key Target Feature | Expected DSSM Signature |
|---------|---------|-------------------|------------------------|

## 5. FALSIFICATION TEST
Two sentences only: what specific finding would disprove DSSM predictions here?

## 6. ZONE DETAILS
For each zone in the summary table — 3 bullets max: DSSM justification, top satellite signatures, predicted artifacts.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: getSystemPrompt('satellite'),
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ answer: response.content[0]?.text || '' });
  } catch (err) {
    console.error('Predict error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
