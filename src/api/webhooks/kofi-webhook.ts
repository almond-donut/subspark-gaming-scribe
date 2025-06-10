import { supabase } from '@/integrations/supabase/client';

interface KofiWebhookEvent {
  data: {
    message_id: string;
    timestamp: string;
    type: 'Donation' | 'Subscription' | 'Shop Order';
    is_public: boolean;
    from_name: string;
    email: string;
    message: string;
    amount: string;
    currency: string;
    url: string;
    verification_token: string;
    tier_name?: string;
    kofi_transaction_id: string;
    shop_items?: any[];
    is_subscription_payment?: boolean;
    is_first_subscription_payment?: boolean;
    subscription_tier_name?: string;
    subscription_id?: string;
    recurrence?: string;
  };
}

// Ko-fi verification token should be set as an environment variable
const KOFI_VERIFICATION_TOKEN = process.env.KOFI_VERIFICATION_TOKEN || 'your_kofi_verification_token';

/**
 * Verify Ko-fi webhook authenticity
 * @param token - The verification token from the webhook
 * @returns {boolean} - Whether the token is valid
 */
const verifyKofiToken = (token: string): boolean => {
  // Compare the received token with the stored one
  return token === KOFI_VERIFICATION_TOKEN;
};

/**
 * Extract order ID from Ko-fi message or generate one if not found
 */
const extractOrderId = (event: KofiWebhookEvent): string => {
  // Try to extract order ID from the message field
  const message = event.data.message || '';
  const orderIdMatch = message.match(/order[:\s]+([A-Za-z0-9-]+)/i);
  
  if (orderIdMatch && orderIdMatch[1]) {
    return orderIdMatch[1];
  }
  
  // If no order ID found, create one using Ko-fi transaction ID
  return `KF-${event.data.kofi_transaction_id || new Date().getTime()}`;
};

/**
 * Handle Ko-fi webhook events
 * @param event - The parsed webhook event
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const handleKofiEvent = async (
  event: KofiWebhookEvent
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verify the webhook token
    if (!verifyKofiToken(event.data.verification_token)) {
      return { 
        success: false, 
        message: 'Invalid verification token' 
      };
    }

    // Extract or generate order ID
    const orderId = extractOrderId(event);
    const { email } = event.data;
    
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError) {
      console.error('Error finding user:', userError);
      return { 
        success: false, 
        message: `User not found for email ${email}` 
      };
    }
    
    const userId = userData?.id;

    // Process based on event type
    switch (event.data.type) {
      case 'Donation': {
        // Check if this is a one-time payment for a subscription
        const isSubscriptionPayment = event.data.message?.toLowerCase().includes('subscription') || 
          event.data.message?.toLowerCase().includes('plan');

        if (isSubscriptionPayment) {
          // Determine plan type and credits based on amount
          let planType = 'starter';
          let creditsTotal = 2;
          const amount = parseFloat(event.data.amount);
          
          if (amount >= 40) {
            planType = 'creatorpro';
            creditsTotal = 50;
          } else if (amount >= 10) {
            planType = 'quickclips';
            creditsTotal = 8;
          }
          
          // Create or update subscription
          const { data: subscriptionData, error: subError } = await supabase
            .from('subscriptions')
            .upsert([{
              user_id: userId,
              plan: planType,
              status: 'active',
              credits_used: 0,
              credits_total: creditsTotal,
              payment_method: 'ko-fi',
              start_date: new Date().toISOString(),
              // One-time payment subscriptions last for 30 days
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }], { 
              onConflict: 'user_id', 
              ignoreDuplicates: false 
            })
            .select('id')
            .single();

          if (subError) {
            console.error('Error creating subscription:', subError);
            return { 
              success: false, 
              message: 'Failed to create subscription' 
            };
          }

          // Create payment record
          await supabase.from('payments').insert([{
            user_id: userId,
            subscription_id: subscriptionData.id,
            amount: parseFloat(event.data.amount),
            currency: event.data.currency,
            payment_method: 'ko-fi',
            status: 'completed',
            order_id: orderId,
            transaction_id: event.data.kofi_transaction_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

          return { 
            success: true, 
            message: `Subscription created for ${email} with plan ${planType}` 
          };
        }
        
        // Regular donation without subscription - could be implemented based on needs
        return { 
          success: true, 
          message: `Donation received from ${email}` 
        };
      }

      case 'Subscription': {
        // Determine plan type and credits based on tier name
        let planType = 'starter';
        let creditsTotal = 2;
        
        const tierName = event.data.tier_name || 
          event.data.subscription_tier_name || 
          'Starter';
        
        if (tierName.toLowerCase().includes('pro') || 
            tierName.toLowerCase().includes('creator')) {
          planType = 'creatorpro';
          creditsTotal = 50;
        } else if (tierName.toLowerCase().includes('quick') || 
                  tierName.toLowerCase().includes('clips')) {
          planType = 'quickclips';
          creditsTotal = 8;
        }
        
        // Is this a recurring payment or first subscription?
        const isFirstPayment = event.data.is_first_subscription_payment || false;
        
        // Update existing subscription or create new one
        if (isFirstPayment) {
          // Create new subscription
          const { data: subscriptionData, error: subError } = await supabase
            .from('subscriptions')
            .insert([{
              user_id: userId,
              plan: planType,
              status: 'active',
              credits_used: 0,
              credits_total: creditsTotal,
              payment_method: 'ko-fi',
              start_date: new Date().toISOString(),
              // Recurrence is typically 'Monthly' or 'Yearly'
              end_date: event.data.recurrence === 'Yearly' 
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select('id')
            .single();
            
          if (subError) {
            console.error('Error creating subscription:', subError);
            return { 
              success: false, 
              message: 'Failed to create subscription' 
            };
          }
          
          // Create payment record
          await supabase.from('payments').insert([{
            user_id: userId,
            subscription_id: subscriptionData.id,
            amount: parseFloat(event.data.amount),
            currency: event.data.currency,
            payment_method: 'ko-fi',
            status: 'completed',
            order_id: orderId,
            transaction_id: event.data.kofi_transaction_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        } else {
          // Find existing subscription
          const { data: existingSubscription, error: findError } = await supabase
            .from('subscriptions')
            .select('id, end_date')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (findError) {
            console.error('Error finding subscription:', findError);
            // Create a new subscription instead
            const { data: newSubscription, error: createError } = await supabase
              .from('subscriptions')
              .insert([{
                user_id: userId,
                plan: planType,
                status: 'active',
                credits_used: 0,
                credits_total: creditsTotal,
                payment_method: 'ko-fi',
                start_date: new Date().toISOString(),
                end_date: event.data.recurrence === 'Yearly' 
                  ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])
              .select('id')
              .single();
              
            if (createError) {
              console.error('Error creating subscription:', createError);
              return { 
                success: false, 
                message: 'Failed to create subscription' 
              };
            }
            
            // Create payment record
            await supabase.from('payments').insert([{
              user_id: userId,
              subscription_id: newSubscription.id,
              amount: parseFloat(event.data.amount),
              currency: event.data.currency,
              payment_method: 'ko-fi',
              status: 'completed',
              order_id: orderId,
              transaction_id: event.data.kofi_transaction_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
            return { 
              success: true, 
              message: `New subscription created for ${email}` 
            };
          }
          
          // Update existing subscription
          const currentEndDate = new Date(existingSubscription.end_date);
          const newEndDate = event.data.recurrence === 'Yearly'
            ? new Date(currentEndDate.getTime() + 365 * 24 * 60 * 60 * 1000)
            : new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            
          await supabase
            .from('subscriptions')
            .update({ 
              status: 'active',
              end_date: newEndDate.toISOString(),
              // Reset credits on renewal
              credits_used: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSubscription.id);
            
          // Create payment record
          await supabase.from('payments').insert([{
            user_id: userId,
            subscription_id: existingSubscription.id,
            amount: parseFloat(event.data.amount),
            currency: event.data.currency,
            payment_method: 'ko-fi',
            status: 'completed',
            order_id: orderId,
            transaction_id: event.data.kofi_transaction_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        }
        
        return { 
          success: true, 
          message: `Subscription ${isFirstPayment ? 'created' : 'renewed'} for ${email}` 
        };
      }
      
      default:
        // Log unhandled event types
        console.log(`Unhandled Ko-fi event type: ${event.data.type}`);
        return { 
          success: true, 
          message: `Event acknowledged but not processed: ${event.data.type}` 
        };
    }
  } catch (error) {
    console.error('Error processing Ko-fi webhook:', error);
    return { 
      success: false, 
      message: 'Internal server error processing webhook' 
    };
  }
};

/**
 * Ko-fi webhook handler
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
const kofiWebhook = async (req, res) => {
  try {
    const kofiData = req.body.data;
    
    // Ko-fi sends data in a nested object
    if (!kofiData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Ko-fi webhook payload' 
      });
    }

    // Process the webhook event
    const result = await handleKofiEvent(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Ko-fi webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export default kofiWebhook;
