/* ===================================================================
   api/create-order.js — Cashfree Payment Gateway Order Creator
   Supports Vercel Serverless Function & Express middleware
   =================================================================== */

// Load dotenv for local environment fallback
try {
  require('dotenv').config();
} catch (e) {}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = (process.env.CASHFREE_ENV || 'production').toLowerCase();

  if (!appId || !secretKey) {
    return res.status(500).json({
      success: false,
      message: 'Cashfree API credentials are not configured on the server. Please check CASHFREE_APP_ID and CASHFREE_SECRET_KEY.'
    });
  }

  try {
    const {
      order_id,
      order_amount,
      customer_name,
      customer_email,
      customer_phone,
      order_note,
      return_url
    } = req.body || {};

    if (!order_id || !order_amount) {
      return res.status(400).json({ success: false, message: 'Missing order_id or order_amount.' });
    }

    const parsedAmount = parseFloat(order_amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order_amount.' });
    }

    // Clean phone number: Cashfree requires 10 digits
    const cleanedPhone = (customer_phone || '').replace(/\D/g, '').slice(-10);
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Customer phone must be at least 10 valid digits.' });
    }

    // Safe customer ID
    const customerId = 'cust_' + (cleanedPhone || Date.now().toString());

    // Resolve API URL based on environment
    const baseUrl = env === 'sandbox'
      ? 'https://sandbox.cashfree.com/pg'
      : 'https://api.cashfree.com/pg';

    // Fallback return URL
    const fallbackReturnUrl = `https://dishamail.site/confirmation.html?order_id={order_id}`;
    const effectiveReturnUrl = return_url || fallbackReturnUrl;

    const payload = {
      order_id: String(order_id),
      order_amount: Math.round(parsedAmount * 100) / 100, // round to 2 decimals
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: (customer_name || 'Customer').trim(),
        customer_email: (customer_email || 'customer@dishamail.site').trim(),
        customer_phone: cleanedPhone
      },
      order_meta: {
        return_url: effectiveReturnUrl,
        notify_url: null
      },
      order_note: order_note || 'DishaMail Hardware & Services'
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cashfree Create Order Error]', data);
      return res.status(response.status).json({
        success: false,
        message: data.message || 'Cashfree rejected order creation.',
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      payment_session_id: data.payment_session_id,
      cf_order_id: data.cf_order_id,
      order_id: data.order_id,
      order_status: data.order_status,
      env: env
    });

  } catch (err) {
    console.error('[Create Order Server Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating Cashfree order: ' + err.message
    });
  }
};
