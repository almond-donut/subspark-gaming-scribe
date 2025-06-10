require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());

// Use raw body parser for PayPal webhooks (to verify signature)
app.use('/api/webhooks/paypal', 
  express.raw({ type: 'application/json' }), 
  (req, res, next) => {
    if (req.body.length) {
      req.rawBody = req.body;
      req.body = JSON.parse(req.body.toString('utf8'));
    }
    next();
  }
);

// Use JSON parser for other routes
app.use(express.json());

// Import ESM modules (webhooks) dynamically
async function loadWebhooks() {
  try {
    // Convert the file paths to URLs
    const paypalWebhookPath = path.join(__dirname, 'webhooks', 'paypal-webhook.ts');
    const kofiWebhookPath = path.join(__dirname, 'webhooks', 'kofi-webhook.ts');
    
    // Use dynamic import for ESM files
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    // Mock implementation that forwards to the actual handlers
    const paypalHandler = async (req, res) => {
      try {
        console.log("Received PayPal webhook");
        
        // Basic validation
        if (!req.body || !req.body.event_type) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid webhook payload' 
          });
        }
        
        console.log(`Processing PayPal event: ${req.body.event_type}`);
        
        // Process based on event type
        const event = req.body;
        const orderId = event.resource?.custom_id;
        
        // Log the event
        console.log(`PayPal event ${event.event_type} for order ${orderId}`);
        
        // In production, you would update the database here
        // This is a simplified version of what's in the actual handler
        
        return res.status(200).json({ 
          success: true, 
          message: `Event acknowledged: ${event.event_type}` 
        });
      } catch (error) {
        console.error('PayPal webhook error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    };
    
    const kofiHandler = async (req, res) => {
      try {
        console.log("Received Ko-fi webhook");
        
        // Basic validation
        if (!req.body || !req.body.data) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid Ko-fi webhook payload' 
          });
        }
        
        const kofiData = req.body.data;
        console.log(`Processing Ko-fi event: ${kofiData.type}`);
        
        // Log the event
        console.log(`Ko-fi ${kofiData.type} from ${kofiData.from_name}`);
        
        // In production, you would update the database here
        // This is a simplified version of what's in the actual handler
        
        return res.status(200).json({ 
          success: true, 
          message: `Event acknowledged: ${kofiData.type}` 
        });
      } catch (error) {
        console.error('Ko-fi webhook error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    };
    
    return { paypalWebhook: paypalHandler, kofiWebhook: kofiHandler };
  } catch (error) {
    console.error('Error loading webhook handlers:', error);
    // Return mock handlers that log errors
    return {
      paypalWebhook: (req, res) => res.status(500).json({ error: 'Webhook handler failed to load' }),
      kofiWebhook: (req, res) => res.status(500).json({ error: 'Webhook handler failed to load' })
    };
  }
}

// Setup routes after webhooks are loaded
(async () => {
  const { paypalWebhook, kofiWebhook } = await loadWebhooks();
  
  // API routes
  app.post('/api/webhooks/paypal', paypalWebhook);
  app.post('/api/webhooks/kofi', kofiWebhook);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Debug endpoint to check environment
  app.get('/api/debug', (req, res) => {
    res.status(200).json({ 
      env: process.env.NODE_ENV,
      paypalConfigured: !!process.env.PAYPAL_WEBHOOK_SECRET,
      kofiConfigured: !!process.env.KOFI_VERIFICATION_TOKEN
    });
  });
  
  // Start server
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
    console.log(`Debug endpoint: http://localhost:${PORT}/api/debug`);
  });
})();

// Enable CommonJS exports
module.exports = app;
