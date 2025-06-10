// WebHook handler index
import paypalWebhookHandler from './paypal-webhook';
import kofiWebhookHandler from './kofi-webhook';

// Export as ESM for TypeScript
export const paypalWebhook = paypalWebhookHandler;
export const kofiWebhook = kofiWebhookHandler;

// Export as CommonJS for compatibility with server.js
export default {
  paypalWebhook: paypalWebhookHandler,
  kofiWebhook: kofiWebhookHandler
};
