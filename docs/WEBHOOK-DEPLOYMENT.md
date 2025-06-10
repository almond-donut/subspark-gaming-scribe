# Webhook Server Production Deployment Guide

This guide explains how to deploy the VODSCRIBE webhook server to production environments.

## Prerequisites

- Node.js 18+ installed on the server
- A domain name with SSL certificate (required for PayPal and Ko-fi)
- Access to PayPal Developer Dashboard and/or Ko-fi account

## Deployment Options

### Option 1: Standalone Express Server

This is the simplest option, deploying the webhook server as a standalone Express application.

1. Clone the repository on your server
2. Install dependencies:
   ```bash
   npm install --production
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```
4. Start the server:
   ```bash
   npm run server
   ```

#### Using PM2 for Process Management

To ensure the webhook server stays running:

1. Install PM2:
   ```bash
   npm install -g pm2
   ```
2. Start the server with PM2:
   ```bash
   pm2 start src/api/server.js --name "webhook-server"
   ```
3. Set up PM2 to start on boot:
   ```bash
   pm2 startup
   pm2 save
   ```

### Option 2: Serverless Deployment (AWS Lambda)

For a serverless deployment using AWS Lambda:

1. Create a new Lambda function
2. Set up environment variables in the Lambda configuration
3. Use a tool like Serverless Framework to package and deploy:
   ```bash
   npm install -g serverless
   serverless deploy
   ```

## Setting Up Reverse Proxy with NGINX

If you're running other services on the same server:

```nginx
server {
    listen 80;
    server_name webhook.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name webhook.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuring Payment Providers

### PayPal

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to Webhooks under the "My Apps & Credentials" section
3. Create a new webhook with your production URL:
   ```
   https://webhook.yourdomain.com/api/webhooks/paypal
   ```
4. Subscribe to the required event types
5. Copy the webhook ID and set it as `PAYPAL_WEBHOOK_SECRET` in your environment

### Ko-fi

1. Log in to your [Ko-fi account](https://ko-fi.com)
2. Go to Settings > API
3. Enable webhooks and enter your production URL:
   ```
   https://webhook.yourdomain.com/api/webhooks/kofi
   ```
4. Copy the verification token and set it as `KOFI_VERIFICATION_TOKEN` in your environment

## Monitoring and Logging

### Setting Up Logging

1. Add a logging service like Winston or Pino:
   ```bash
   npm install winston
   ```

2. Create a custom logger in `src/api/utils/logger.js`

3. Configure log rotation and storage

### Monitoring with Prometheus/Grafana

For advanced monitoring, set up Prometheus and Grafana:

1. Instrument your Express app with Prometheus metrics
2. Configure alerts for service disruptions

## Security Best Practices

1. **Keep secrets secure** - Never commit API keys or webhook secrets to your code repository
2. **Set up rate limiting** - Protect against abuse with Express rate limiters
3. **Validate all webhook payloads** - Always verify signatures and tokens
4. **Use HTTPS only** - Payment providers require secure connections
5. **Update dependencies regularly** - Run `npm audit` and update vulnerable packages

## Troubleshooting

Common issues and solutions:

1. **Webhook verification failing** - Double check your environment variables match the values from PayPal/Ko-fi
2. **Events not processing** - Check server logs and ensure database connectivity
3. **Server crashing** - Look for uncaught exceptions and implement proper error handling

For more detailed logs, set the `DEBUG` environment variable:
```bash
DEBUG=express:* npm run server
```
