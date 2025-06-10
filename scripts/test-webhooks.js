/**
 * Webhook Testing Tool
 * 
 * This script can be used to simulate webhook events from PayPal and Ko-fi
 * during development and testing.
 */

require('dotenv').config();
const fetch = require('node-fetch');
const readline = require('readline');
const crypto = require('crypto');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default webhook URL (local development server)
const DEFAULT_WEBHOOK_URL = 'http://localhost:3001';

// Sample event payloads
const SAMPLE_PAYLOADS = {
  paypal: {
    paymentCompleted: {
      id: `WH-${crypto.randomBytes(10).toString('hex').toUpperCase()}`,
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: {
        id: crypto.randomBytes(10).toString('hex').toUpperCase(),
        status: 'COMPLETED',
        custom_id: `VOD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
        amount: {
          total: '11.99',
          currency: 'USD'
        },
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      },
      create_time: new Date().toISOString()
    },
    paymentDenied: {
      id: `WH-${crypto.randomBytes(10).toString('hex').toUpperCase()}`,
      event_type: 'PAYMENT.CAPTURE.DENIED',
      resource: {
        id: crypto.randomBytes(10).toString('hex').toUpperCase(),
        status: 'DENIED',
        custom_id: `VOD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
        amount: {
          total: '11.99',
          currency: 'USD'
        },
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      },
      create_time: new Date().toISOString()
    },
    subscriptionCancelled: {
      id: `WH-${crypto.randomBytes(10).toString('hex').toUpperCase()}`,
      event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: {
        id: crypto.randomBytes(10).toString('hex').toUpperCase(),
        status: 'CANCELLED',
        custom_id: `VOD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      },
      create_time: new Date().toISOString()
    }
  },
  kofi: {
    donation: {
      data: {
        message_id: `ko-fi-${crypto.randomBytes(8).toString('hex')}`,
        timestamp: new Date().toISOString(),
        type: 'Donation',
        is_public: true,
        from_name: 'Test Donor',
        email: 'test@example.com',
        message: `For order VOD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
        amount: '11.99',
        currency: 'USD',
        url: `https://ko-fi.com/Home/CoffeeShop?txid=${crypto.randomBytes(8).toString('hex')}`,
        verification_token: process.env.KOFI_VERIFICATION_TOKEN || 'test_token',
        kofi_transaction_id: crypto.randomBytes(8).toString('hex')
      }
    },
    subscription: {
      data: {
        message_id: `ko-fi-${crypto.randomBytes(8).toString('hex')}`,
        timestamp: new Date().toISOString(),
        type: 'Subscription',
        is_public: true,
        from_name: 'Test Subscriber',
        email: 'test@example.com',
        message: '',
        tier_name: 'Quick Clips',
        is_subscription_payment: true,
        is_first_subscription_payment: true,
        subscription_tier_name: 'Quick Clips',
        subscription_id: `sub-${crypto.randomBytes(8).toString('hex')}`,
        amount: '11.99',
        currency: 'USD',
        recurrence: 'Monthly',
        url: `https://ko-fi.com/Home/CoffeeShop?txid=${crypto.randomBytes(8).toString('hex')}`,
        verification_token: process.env.KOFI_VERIFICATION_TOKEN || 'test_token',
        kofi_transaction_id: crypto.randomBytes(8).toString('hex')
      }
    }
  }
};

/**
 * Send a webhook event to the specified endpoint
 */
async function sendWebhookEvent(provider, eventType, baseUrl = DEFAULT_WEBHOOK_URL) {
  try {
    // Get the appropriate payload
    const payload = SAMPLE_PAYLOADS[provider][eventType];
    if (!payload) {
      console.error(`Unknown event type: ${eventType} for provider ${provider}`);
      return;
    }

    // Determine the endpoint URL
    const endpoint = `${baseUrl}/api/webhooks/${provider}`;
    console.log(`Sending ${provider} ${eventType} webhook to: ${endpoint}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Send the request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Test-Tool/1.0'
      },
      body: JSON.stringify(payload)
    });

    // Parse and display the response
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    console.log(`Response (${response.status}):`, responseData);
  } catch (error) {
    console.error('Error sending webhook:', error.message);
  }
}

/**
 * Display the main menu and handle user input
 */
function showMenu() {
  console.log('\n=== Webhook Testing Tool ===\n');
  console.log('1. PayPal - Payment Completed');
  console.log('2. PayPal - Payment Denied');
  console.log('3. PayPal - Subscription Cancelled');
  console.log('4. Ko-fi - Donation');
  console.log('5. Ko-fi - Subscription');
  console.log('0. Exit');
  
  rl.question('\nSelect an option: ', async (answer) => {
    switch (answer) {
      case '1':
        await sendWebhookEvent('paypal', 'paymentCompleted');
        break;
      case '2':
        await sendWebhookEvent('paypal', 'paymentDenied');
        break;
      case '3':
        await sendWebhookEvent('paypal', 'subscriptionCancelled');
        break;
      case '4':
        await sendWebhookEvent('kofi', 'donation');
        break;
      case '5':
        await sendWebhookEvent('kofi', 'subscription');
        break;
      case '0':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid option. Please try again.');
    }
    // Show the menu again after processing the selection
    showMenu();
  });
}

// Start the application
showMenu();
