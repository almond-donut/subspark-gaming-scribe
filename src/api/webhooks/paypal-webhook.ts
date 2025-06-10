import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    custom_id?: string;
    amount?: {
      total: string;
      currency: string;
    };
    payer?: {
      email_address: string;
    };
    create_time: string;
    update_time: string;
  };
  create_time: string;
}

// PayPal webhook secret should be stored as an environment variable
const PAYPAL_WEBHOOK_SECRET = process.env.PAYPAL_WEBHOOK_SECRET || 'your_paypal_webhook_secret';

/**
 * Verify PayPal webhook signature
 * @param body - The raw request body
 * @param headers - The request headers containing PayPal signature
 * @returns {boolean} - Whether the signature is valid
 */
const verifyPayPalSignature = (
  body: string,
  headers: Record<string, string>
): boolean => {
  const transmissionId = headers['paypal-transmission-id'];
  const timestamp = headers['paypal-transmission-time'];
  const webhookId = PAYPAL_WEBHOOK_SECRET;
  const signature = headers['paypal-transmission-sig'];
  const certUrl = headers['paypal-cert-url'];

  // For production, you should verify the certificate URL is from PayPal
  if (!certUrl.startsWith('https://api.paypal.com/')) {
    return false;
  }

  // Create the validation string
  const validationString = `${transmissionId}|${timestamp}|${webhookId}|${body}`;

  // In production, you should get the public key from PayPal using the cert URL
  // For this example, we'll assume we have the public key
  // This is simplified - in production, use a proper verification library
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(validationString);
    return true; // placeholder - in production verify with actual key
  } catch (error) {
    console.error('PayPal signature verification error:', error);
    return false;
  }
};

/**
 * Handle PayPal webhook events
 * @param body - The parsed webhook event
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const handlePayPalEvent = async (
  event: PayPalWebhookEvent
): Promise<{ success: boolean; message: string }> => {
  try {
    // Extract order ID from custom_id field
    const orderId = event.resource.custom_id;
    if (!orderId) {
      return { 
        success: false, 
        message: 'Missing order ID in webhook payload' 
      };
    }
    
    // Main event handling logic based on event type
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'CHECKOUT.ORDER.APPROVED': {
        // Find the payment record by order_id
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('id, user_id, subscription_id, status')
          .eq('order_id', orderId)
          .single();

        if (paymentError || !paymentData) {
          console.error('Error finding payment record:', paymentError);
          return { 
            success: false, 
            message: `Payment record not found for order ${orderId}` 
          };
        }

        // Update payment status to completed
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            transaction_id: event.resource.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.id);

        if (updateError) {
          console.error('Error updating payment record:', updateError);
          return { 
            success: false, 
            message: 'Failed to update payment status' 
          };
        }

        // Update subscription status to active if needed
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.subscription_id);

        return { 
          success: true, 
          message: `Payment completed for order ${orderId}` 
        };
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        // Find the payment record by order_id
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('id, user_id, subscription_id')
          .eq('order_id', orderId)
          .single();

        if (paymentError || !paymentData) {
          console.error('Error finding payment record:', paymentError);
          return { 
            success: false, 
            message: `Payment record not found for order ${orderId}` 
          };
        }

        // Update payment status to failed or reversed
        const newStatus = event.event_type === 'PAYMENT.CAPTURE.DENIED' 
          ? 'failed' 
          : 'reversed';
          
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: newStatus,
            transaction_id: event.resource.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.id);

        if (updateError) {
          console.error('Error updating payment record:', updateError);
          return { 
            success: false, 
            message: 'Failed to update payment status' 
          };
        }

        // Update subscription status to inactive
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.subscription_id);

        return { 
          success: true, 
          message: `Payment ${newStatus} for order ${orderId}` 
        };
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        // Find the subscription using a custom identifier if needed
        // For this implementation, we assume the orderId contains subscription info

        // Find the subscription using the order_id from the payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('id, subscription_id')
          .eq('order_id', orderId)
          .single();

        if (paymentError || !paymentData) {
          console.error('Error finding payment record:', paymentError);
          return { 
            success: false, 
            message: `Payment record not found for order ${orderId}` 
          };
        }

        // Update subscription status to canceled or inactive
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ 
            status: event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 'inactive',
            end_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.subscription_id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return { 
            success: false, 
            message: 'Failed to update subscription status' 
          };
        }

        return { 
          success: true, 
          message: `Subscription ${event.event_type.toLowerCase()} for order ${orderId}` 
        };
      }

      default:
        // Log unhandled event types
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
        return { 
          success: true, 
          message: `Event acknowledged but not processed: ${event.event_type}` 
        };
    }
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return { 
      success: false, 
      message: 'Internal server error processing webhook' 
    };
  }
};

/**
 * PayPal webhook handler
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
const paypalWebhook = async (req, res) => {
  try {
    const rawBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const isSignatureValid = verifyPayPalSignature(rawBody, req.headers);
    
    if (!isSignatureValid) {
      console.error('Invalid PayPal webhook signature');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid signature' 
      });
    }

    // Process the webhook event
    const result = await handlePayPalEvent(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export default paypalWebhook;
