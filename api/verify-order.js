/* ===================================================================
   api/verify-order.js — Verify Cashfree Order & Payment Status
   Supports Vercel Serverless Function & Express middleware
   =================================================================== */

try {
  require('dotenv').config();
} catch (e) {}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use GET.' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = (process.env.CASHFREE_ENV || 'production').toLowerCase();

  if (!appId || !secretKey) {
    return res.status(500).json({
      success: false,
      message: 'Cashfree API credentials are not configured on the server.'
    });
  }

  try {
    const orderId = req.query.order_id;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing order_id query parameter.' });
    }

    const baseUrl = env === 'sandbox'
      ? 'https://sandbox.cashfree.com/pg'
      : 'https://api.cashfree.com/pg';

    const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cashfree Verify Order Error]', data);
      return res.status(response.status).json({
        success: false,
        message: data.message || 'Unable to fetch order details from Cashfree.',
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      order_id: data.order_id,
      cf_order_id: data.cf_order_id,
      order_status: data.order_status, // "PAID", "ACTIVE", "EXPIRED", etc.
      order_amount: data.order_amount,
      order_currency: data.order_currency,
      customer_details: data.customer_details,
      created_at: data.created_at
    });

  } catch (err) {
    console.error('[Verify Order Server Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying Cashfree order: ' + err.message
    });
  }
};
