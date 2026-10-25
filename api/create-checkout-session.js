const https = require('https');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

const PRICES = {
  '1_month': 'price_1UTol4GS4W9CZHGineHZpAN2',
  '3_months': 'price_1UTol5GS4W9CZHGiNLpulrOw',
  '6_months': 'price_1UTol6GS4W9CZHGiPfsbJceK'
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const planId = body.planId || '3_months';
    const email = body.email || undefined;
    const priceId = PRICES[planId] || PRICES['3_months'];

    const origin = req.headers.origin || 'https://verticam.vercel.app';
    const returnUrl = `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;

    const params = [
      `ui_mode=embedded_page`,
      `mode=subscription`,
      `line_items[0][price]=${encodeURIComponent(priceId)}`,
      `line_items[0][quantity]=1`,
      `return_url=${encodeURIComponent(returnUrl)}`,
      `allow_promotion_codes=true`,
      `locale=it`
    ];

    if (email && email.includes('@')) {
      params.push(`customer_email=${encodeURIComponent(email.trim())}`);
    }

    const postData = params.join('&');

    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: '/v1/checkout/sessions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const stripeReq = https.request(options, (stripeRes) => {
      let data = '';
      stripeRes.on('data', chunk => data += chunk);
      stripeRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (stripeRes.statusCode >= 400) {
            return res.status(stripeRes.statusCode).json({ error: parsed.error?.message || 'Stripe error' });
          }
          return res.status(200).json({ 
            clientSecret: parsed.client_secret, 
            sessionId: parsed.id,
            publishableKey: STRIPE_PUBLISHABLE_KEY
          });
        } catch (e) {
          return res.status(500).json({ error: 'Failed to parse Stripe response' });
        }
      });
    });

    stripeReq.on('error', (err) => {
      return res.status(500).json({ error: err.message });
    });

    stripeReq.write(postData);
    stripeReq.end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
