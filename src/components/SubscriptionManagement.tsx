import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionManagementProps {
  className?: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ className }) => {
  const { subscription } = useAuth();
  
  // Calculate subscription metrics
  const creditsUsed = subscription?.credits_used || 0;
  const totalCredits = subscription?.credits_total || 0;
  const creditsRemaining = Math.max(0, totalCredits - creditsUsed);
  const usagePercentage = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;

  // Format plan name
  const formatPlanName = (plan: string | undefined) => {
    if (!plan) return 'Free';
    
    switch (plan) {
      case 'free':
        return 'Free Preview';
      case 'starter':
        return 'Starter Preview Upgrade';
      case 'quickclips':
        return 'Quick Clips';
      case 'creatorpro':
        return 'Creator Pro';
      default:
        return plan.charAt(0).toUpperCase() + plan.slice(1);
    }
  };

  // Get plan description
  const getPlanDescription = (plan: string | undefined) => {
    if (!plan) return '';
    
    switch (plan) {
      case 'free':
        return 'Basic preview translation - 1 free submission';
      case 'starter':
        return 'Enhanced preview translations - 2 submissions';
      case 'quickclips':
        return 'Quick content up to 10 minutes - 8 submissions';
      case 'creatorpro':
        return 'Professional translations up to 60 minutes - 50 submissions';
      default:
        return '';
    }
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>Current plan and usage details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Plan</h3>
                <p className="text-xl font-bold">{formatPlanName(subscription.plan)}</p>
                <p className="text-sm text-slate-500 mt-1">{getPlanDescription(subscription.plan)}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {subscription.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Subscription Details</h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-sm text-slate-500">Start Date</p>
                    <p className="font-medium">{formatDate(subscription.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">End Date</p>
                    <p className="font-medium">
                      {subscription.end_date ? formatDate(subscription.end_date) : 'Ongoing'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Usage ({creditsUsed} of {totalCredits} credits)
                </h3>
                <span className="text-sm text-slate-500">
                  {creditsRemaining} remaining
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">
                {subscription.plan === 'quickclips' ? 'Credits reset weekly' : 'Credits reset monthly'}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              You don't have an active subscription yet.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Choose a plan to get access to full subtitle features.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to="/payment">
          <Button variant={subscription?.status === 'active' ? 'outline' : 'default'}>
            {subscription?.status === 'active' ? 'Change Plan' : 'Get a Plan'}
          </Button>
        </Link>
        {subscription?.status === 'active' && (
          <div className="text-right">
            <p className="text-sm text-slate-500">
              Payment Method: <span className="font-medium capitalize">{subscription.payment_method || 'N/A'}</span>
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionManagement;
