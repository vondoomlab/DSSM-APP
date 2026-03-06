const express = require('express');
const router  = express.Router();
const Stripe  = require('stripe');
const { supabaseAdmin } = require('../utils/supabase');

const stripe = process.env.STRIPE_SECRET_KEY
  ? Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Credit packages — match these to your Stripe product prices
const PACKAGES = [
  { id: 'starter',  credits: 150, price_id: process.env.STRIPE_PRICE_STARTER,  label: 'Scholar',  amount: '$5'  },
  { id: 'research', credits: 450, price_id: process.env.STRIPE_PRICE_RESEARCH, label: 'Academic', amount: '$33' },
];

// GET /api/stripe/packages — returns available packages
router.get('/packages', (req, res) => {
  res.json({ packages: PACKAGES.map(p => ({ id: p.id, credits: p.credits, label: p.label, amount: p.amount })) });
});

// POST /api/stripe/checkout — creates a Stripe Checkout session
router.post('/checkout', async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid session' });

  const { package_id } = req.body;
  const pkg = PACKAGES.find(p => p.id === package_id);
  if (!pkg || !pkg.price_id) return res.status(400).json({ error: 'Invalid package' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: pkg.price_id, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}?payment=success&credits=${pkg.credits}`,
      cancel_url:  `${process.env.FRONTEND_URL}?payment=cancelled`,
      metadata: {
        user_id:  user.id,
        credits:  pkg.credits.toString(),
        package:  pkg.id,
      },
      customer_email: user.email,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});


// Webhook handler exported separately so it can be mounted before express.json()
async function handleWebhook(req, res) {
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const { user_id, credits } = session.metadata;
    const creditsToAdd = parseInt(credits);

    if (user_id && creditsToAdd && supabaseAdmin) {
      const { data: current } = await supabaseAdmin
        .from('credits').select('balance, total_purchased').eq('user_id', user_id).single();

      if (current) {
        await supabaseAdmin.from('credits').update({
          balance:         current.balance + creditsToAdd,
          total_purchased: current.total_purchased + creditsToAdd,
          updated_at:      new Date().toISOString(),
        }).eq('user_id', user_id);

        console.log(`✅ Stripe payment: +${creditsToAdd} credits → user ${user_id}`);
      }
    }
  }

  res.json({ received: true });
}

// Remove duplicate webhook route from router (handled directly in index.js)
module.exports = { router, handleWebhook };
