import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UseSubscriptionResult {
  isLoading: boolean;
  hasValidSubscription: boolean;
  hasCreditsRemaining: boolean;
  validateAndUseCredit: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const useSubscription = (): UseSubscriptionResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, subscription, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Check if user has a valid subscription
  const hasValidSubscription = !!subscription && subscription.status === 'active';
  
  // Check if user has credits remaining
  const hasCreditsRemaining = hasValidSubscription && 
    (subscription.credits_used < subscription.credits_total);

  // Validate and use a credit
  const validateAndUseCredit = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use this feature.",
        variant: "destructive",
      });
      return false;
    }

    if (!hasValidSubscription) {
      toast({
        title: "No Active Subscription",
        description: "You need an active subscription to use this feature.",
        variant: "destructive",
      });
      return false;
    }

    if (!hasCreditsRemaining) {
      toast({
        title: "No Credits Remaining",
        description: "You've used all your credits. Please upgrade your plan.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Update the credits used in the subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          credits_used: subscription.credits_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error updating subscription credits:', error);
        toast({
          title: "Update Error",
          description: "There was an error updating your credits. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Refresh the user profile with updated subscription info
      await refreshProfile();
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh subscription data
  const refreshSubscription = async (): Promise<void> => {
    await refreshProfile();
  };

  return {
    isLoading,
    hasValidSubscription,
    hasCreditsRemaining,
    validateAndUseCredit,
    refreshSubscription
  };
};

export default useSubscription;
