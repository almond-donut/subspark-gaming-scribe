import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentPageProps {
  orderId?: string;
  amount?: string;
  plan?: string;
}

const Payment = ({ orderId: defaultOrderId = 'VOD-12345' }: PaymentPageProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, subscription, refreshProfile } = useAuth();
  
  // Extract plan and amount from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const planParam = queryParams.get('plan');
  const amountParam = queryParams.get('amount');
  
  // Set default values and format them
  const [plan, setPlan] = useState('Quick Clips');
  const [amount, setAmount] = useState('$11.99');
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [email, setEmail] = useState(user?.email || '');
  
  // Redirect user to login if they're not authenticated and trying to purchase a paid plan
  const requiresAuthentication = planParam !== 'free' && planParam !== null;
    useEffect(() => {
    // Generate random order ID with current date
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setOrderId(`VOD-${dateStr}-${randomPart}`);
    
    // Handle plan from URL parameters
    if (planParam) {
      switch (planParam.toLowerCase()) {
        case 'starter':
          setPlan('Starter Preview Upgrade');
          setAmount('$4.99');
          break;
        case 'quickclips':
          setPlan('Quick Clips');
          setAmount('$11.99');
          break;
        case 'creatorpro':
          setPlan('Creator Pro');
          setAmount('$44.99');
          break;
        default:
          setPlan('Quick Clips');
          setAmount('$11.99');
      }
    }
    
    // Override with amount from URL if provided
    if (amountParam) {
      setAmount(`$${amountParam}`);
    }
    
    // Set email from user profile if available
    if (user?.email) {
      setEmail(user.email);
    }
  }, [planParam, amountParam, user]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Get form data
      const formElement = e.target as HTMLFormElement;
      const formEmail = formElement.querySelector<HTMLInputElement>('#email')?.value || email;
      
      if (!formEmail) {
        toast({
          title: "Missing Information",
          description: "Please provide your email address.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create subscription in the database if user is authenticated
      if (user) {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Calculate credits based on plan
        let planType = 'free';
        let creditsTotal = 1;
        
        switch (planParam?.toLowerCase()) {
          case 'starter':
            planType = 'starter';
            creditsTotal = 2;
            break;
          case 'quickclips':
            planType = 'quickclips';
            creditsTotal = 8;
            break;
          case 'creatorpro':
            planType = 'creatorpro';
            creditsTotal = 50;
            break;
        }
        
        // Add subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              plan: planType,
              status: 'active',
              credits_used: 0,
              credits_total: creditsTotal,
              payment_method: selectedMethod,
              start_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }
          ]);
          
        if (subError) {
          console.error('Error creating subscription:', subError);
          toast({
            title: "Subscription Error",
            description: "There was an error creating your subscription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Refresh profile to get the latest subscription info
        refreshProfile();
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentComplete(true);
        
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed. You will receive your subtitles soon!",
          variant: "default",
        });
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  // Redirect to login if they're not authenticated for paid plans
  if (requiresAuthentication && !user) {
    return <Navigate to={`/auth?redirect=payment&plan=${planParam}&amount=${amountParam}`} replace />;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          {user && (
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Dashboard
            </Link>
          )}
        </div>

        {!paymentComplete ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Complete Your Payment</h1>
            
            <div className="grid gap-6 md:grid-cols-5">
              <div className="md:col-span-3">
                <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-100">
                      Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <RadioGroup 
                        value={selectedMethod}
                        onValueChange={setSelectedMethod}
                        className="space-y-4"
                      >
                        {/* PayPal Option */}
                        <div className={`
                          flex items-center justify-between border rounded-lg p-4
                          ${selectedMethod === 'paypal' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-slate-200 dark:border-slate-700'}
                        `}>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <div className="flex flex-col">
                              <Label htmlFor="paypal" className="font-medium text-slate-800 dark:text-slate-100">
                                PayPal
                              </Label>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Pay securely via PayPal
                              </span>
                            </div>
                          </div>
                          <div className="w-16 h-10 flex items-center justify-center bg-blue-600 rounded">
                            <span className="text-white font-bold">PayPal</span>
                          </div>
                        </div>

                        {/* Ko-fi Option */}
                        <div className={`
                          flex items-center justify-between border rounded-lg p-4
                          ${selectedMethod === 'kofi' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-slate-200 dark:border-slate-700'}
                        `}>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="kofi" id="kofi" />
                            <div className="flex flex-col">
                              <Label htmlFor="kofi" className="font-medium text-slate-800 dark:text-slate-100">
                                Ko-fi
                              </Label>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Support via Ko-fi platform
                              </span>
                            </div>
                          </div>
                          <div className="w-16 h-10 flex items-center justify-center bg-[#29abe0] rounded">
                            <span className="text-white text-xs">☕ Ko-fi</span>
                          </div>
                        </div>

                        {/* Wise Transfer */}
                        <div className={`
                          flex items-center justify-between border rounded-lg p-4
                          ${selectedMethod === 'wise' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-slate-200 dark:border-slate-700'}
                        `}>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="wise" id="wise" />
                            <div className="flex flex-col">
                              <Label htmlFor="wise" className="font-medium text-slate-800 dark:text-slate-100">
                                Wise Transfer
                              </Label>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                International bank transfer via Wise
                              </span>
                            </div>
                          </div>
                          <div className="w-16 h-10 flex items-center justify-center bg-[#4cc8ff] rounded">
                            <span className="text-white font-bold text-xs">Wise</span>
                          </div>
                        </div>
                      </RadioGroup>

                      {/* Contact Email */}                      <div>
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="mt-1"
                          required
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          We'll send your payment confirmation and subtitles to this email
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : `Pay ${amount}`}
                        </Button>
                      </div>
                    </form>                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                      <h3 className="font-medium text-sm text-slate-800 dark:text-slate-100 mb-2">Payment Method Details:</h3>
                      
                      {selectedMethod === 'paypal' && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>• You'll be redirected to PayPal to complete your payment securely.</p>
                          <p>• No PayPal account? You can pay with credit/debit card through PayPal's guest checkout.</p>
                          <p>• Your order will be processed immediately after payment confirmation.</p>
                        </div>
                      )}
                      
                      {selectedMethod === 'kofi' && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>• Support us through Ko-fi platform - perfect for content creators!</p>
                          <p>• Include your order number ({orderId}) in the message.</p>
                          <p>• We'll process your order after receiving your Ko-fi notification.</p>
                        </div>
                      )}
                      
                      {selectedMethod === 'wise' && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p>• International bank transfer with lower fees than traditional methods.</p>
                          <p>• You'll receive transfer details after submitting this form.</p>
                          <p>• Please include your order number ({orderId}) as payment reference.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 mt-6 space-x-2">
                      <Shield className="w-3 h-3" />
                      <span>Secure Payment Process</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-100">
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Plan:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Order ID:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{orderId}</span>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-800 dark:text-slate-100">Total:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{amount}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300 mt-4">
                        <p className="font-medium">What's included:</p>
                        <ul className="text-xs mt-2 space-y-1">
                          <li>✅ Full context-aware translation</li>
                          <li>✅ Three SRT files (Original, English & Dual)</li>
                          <li>✅ Priority processing</li>
                          <li>✅ 1-2 files per week (4-8 monthly)</li>
                          <li>✅ Max 90 minutes per file</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (          <Card className="border-green-200 dark:border-green-700 bg-green-50/80 dark:bg-green-950/80">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-200">
                {selectedMethod === 'paypal' 
                  ? 'Payment Successful!' 
                  : selectedMethod === 'kofi' 
                    ? 'Ko-fi Payment Initiated' 
                    : 'Payment Instructions Sent'}
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-5 text-lg">
                {selectedMethod === 'paypal' 
                  ? 'Thank you for your payment. Your subtitle order is now being processed.'
                  : selectedMethod === 'kofi'
                    ? 'Please complete your payment through Ko-fi using the link we sent to your email.'
                    : 'We\'ve sent bank transfer details to your email. Your order will be processed after payment confirmation.'}
              </p>
              <div className="mb-8 bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-300">Order ID:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-300">Plan:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Amount:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{amount}</span>
                </div>
                {(selectedMethod === 'kofi' || selectedMethod === 'wise') && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-amber-600 dark:text-amber-400 text-sm">
                      <strong>Important:</strong> Include your Order ID when completing your payment
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                {selectedMethod === 'paypal' ? (
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    We've sent a confirmation email with all details.
                    Your subtitles will be ready in <span className="font-bold">6 hours</span>.
                  </p>
                ) : (
                  <div className="space-y-4 mb-6">
                    <p className="text-slate-600 dark:text-slate-300">
                      We've sent payment instructions to your email.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-700 dark:text-blue-300">
                      Processing will begin immediately after payment confirmation. For faster service, please send payment confirmation to <span className="font-semibold">vodscribe@proton.me</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => navigate('/')} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payment;
