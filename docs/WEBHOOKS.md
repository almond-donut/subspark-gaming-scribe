# VODSCRIBE Payment Webhook Integration

This document describes how the payment webhooks are integrated with PayPal and Ko-fi for VODSCRIBE's subscription management system.

## Overview

The webhook system allows VODSCRIBE to receive real-time notifications when payment events occur on external payment platforms (PayPal and Ko-fi). This enables automatic updates to user subscriptions based on payment status changes.

## PayPal Webhook Integration

### Setup Instructions

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to Webhooks under the "My Apps & Credentials" section
3. Create a new webhook with the following URL:
   ```
   https://yourdomain.com/api/webhooks/paypal
   ```
4. Subscribe to the following event types:
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
   - PAYMENT.CAPTURE.REVERSED
   - BILLING.SUBSCRIPTION.CANCELLED
   - BILLING.SUBSCRIPTION.EXPIRED

5. Copy the Webhook ID and add it to your `.env` file as `PAYPAL_WEBHOOK_SECRET`

### Data Flow

1. Customer makes a payment through PayPal
2. PayPal sends a webhook event to our endpoint when payment status changes
3. Our webhook handler verifies the signature and processes the event
4. The database is updated with the new payment and subscription status

## Ko-fi Webhook Integration

### Setup Instructions

1. Log in to your [Ko-fi account](https://ko-fi.com)
2. Go to Settings > API
3. Enable webhooks and enter the following URL:
   ```
   https://yourdomain.com/api/webhooks/kofi
   ```
4. Copy the verification token and add it to your `.env` file as `KOFI_VERIFICATION_TOKEN`

### Data Flow

1. Customer makes a donation or subscription payment on Ko-fi
2. Ko-fi sends a webhook event to our endpoint
3. Our webhook handler verifies the token and processes the event
4. The database is updated with the new payment and subscription status

## Testing Webhooks Locally

### Using the built-in test tool

We've included a webhook testing utility to simulate webhook events from PayPal and Ko-fi:

1. Run the server using:
   ```
   npm run dev:server
   ```

2. In a new terminal window, run the testing tool:
   ```
   npm run test:webhooks
   ```

3. Select the webhook event type you want to simulate from the menu

### Using an external tunnel

For testing with real PayPal and Ko-fi sandbox environments:

1. Run the server using `npm run dev:server`
2. Use a tool like [ngrok](https://ngrok.com/) to create a public URL for your local server:
   ```
   ngrok http 3001
   ```
3. Update the webhook URLs in PayPal and Ko-fi to point to your ngrok URL
4. Trigger test events using the PayPal or Ko-fi sandbox/test environments

## Webhook Payload Examples

### PayPal Payment Completed
```json
{
  "id": "WH-58D345951Y271831R-6X0864739E378790H",
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "5TY05013RG091493X",
    "status": "COMPLETED",
    "amount": {
      "total": "11.99",
      "currency": "USD"
    },
    "custom_id": "VOD-20250610-1234",
    "create_time": "2025-06-10T10:30:00Z",
    "update_time": "2025-06-10T10:31:00Z"
  },
  "create_time": "2025-06-10T10:31:05Z"
}
```

### Ko-fi Donation
```json
{
  "data": {
    "message_id": "ko-fi-abcdef123456",
    "timestamp": "2025-06-10T12:30:00Z",
    "type": "Donation",
    "is_public": true,
    "from_name": "Supporter",
    "email": "user@example.com",
    "message": "For order VOD-20250610-5678",
    "amount": "11.99",
    "currency": "USD",
    "url": "https://ko-fi.com/Home/CoffeeShop?txid=abcdef123456",
    "verification_token": "your_verification_token",
    "kofi_transaction_id": "abcdef123456"
  }
}
```

## Database Updates

The webhook handlers update the following tables:

1. `subscriptions`: Status, end dates, and credits
2. `payments`: Creating new payment records with transaction IDs

## Error Handling

Webhook errors are logged to help diagnose issues. Common errors include:
- Invalid signatures/tokens
- Missing order IDs
- Database update failures

Check the server logs for detailed error messages if webhooks aren't working as expected.

## Security Considerations

- All webhook endpoints verify the source of the request using signatures or tokens
- Only process events from known payment providers
- Validate all data before updating the database
- Use HTTPS for all webhook URLs in production
