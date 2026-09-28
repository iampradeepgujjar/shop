/* ===================================================================
   server.js — DishaMail Local & Standalone Production Server
   Serves static shop frontend + Cashfree Payment Gateway APIs
   =================================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const createOrderHandler = require('./api/create-order');
const verifyOrderHandler = require('./api/verify-order');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cashfree API Endpoints
app.post('/api/create-order', createOrderHandler);
app.get('/api/verify-order', verifyOrderHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'Cashfree PG',
    mode: (process.env.CASHFREE_ENV || 'production').toLowerCase(),
    appIdConfigured: Boolean(process.env.CASHFREE_APP_ID),
    secretConfigured: Boolean(process.env.CASHFREE_SECRET_KEY)
  });
});

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  const env = (process.env.CASHFREE_ENV || 'production').toUpperCase();
  const configured = Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);

  console.log('====================================================');
  console.log(`⚡ DishaMail Store Server Running on http://localhost:${PORT}`);
  console.log(`🔒 Cashfree Gateway Mode: [${env}]`);
  console.log(`🔑 Credentials Configured: ${configured ? 'YES (Ready)' : 'NO (Add to .env)'}`);
  console.log('====================================================');
});
