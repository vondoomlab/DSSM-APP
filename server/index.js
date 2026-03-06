require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: true });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const askRoute      = require('./routes/ask');
const classifyRoute = require('./routes/classify');
const scoreRoute    = require('./routes/score');
const satelliteRoute = require('./routes/satellite');
const predictRoute  = require('./routes/predict');
const userRoute     = require('./routes/user');
const stripeRoute   = require('./routes/stripe');

const { requireAuth } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

// Cache
const cache = new NodeCache({ stdTTL: 600 });
app.locals.cache = cache;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));

// ── Stripe webhook — MUST be raw body, registered BEFORE express.json() ───────
app.post('/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeRoute.handleWebhook
);

// ── JSON body parser for all other routes ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests. Please wait a moment.' }
});
app.use('/api/', limiter);

// ── Public routes (no auth) ───────────────────────────────────────────────────
app.use('/api/user',      userRoute);
app.use('/api/stripe',    stripeRoute.router);
app.use('/api/satellite', satelliteRoute);

// ── Protected AI routes — JWT + credits required ──────────────────────────────
app.use('/api/ask',      requireAuth, askRoute);
app.use('/api/classify', requireAuth, classifyRoute);
app.use('/api/score',    requireAuth, scoreRoute);
app.use('/api/predict',  requireAuth, predictRoute);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'DSSM Intelligence System',
    version: '1.1.0',
    auth:   process.env.SUPABASE_URL     ? 'enabled'      : 'dev-mode',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured'  : 'not configured',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🏛️  DSSM Intelligence System — Server running`);
  console.log(`📡  http://localhost:${PORT}`);
  console.log(`🔑  Claude API:  ${process.env.ANTHROPIC_API_KEY    ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🛰️  OpenTopo:    ${process.env.OPENTOPO_API_KEY     ? '✅ Configured' : '⚠️  Optional'}`);
  console.log(`🔐  Supabase:   ${process.env.SUPABASE_URL          ? '✅ Auth enabled' : '⚠️  Dev mode (no auth)'}`);
  console.log(`💳  Stripe:     ${process.env.STRIPE_SECRET_KEY     ? '✅ Configured' : '⚠️  Add keys to enable payments'}\n`);
});
