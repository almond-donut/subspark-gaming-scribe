import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, DollarSign, Loader, Star, Shield, Clock } from 'lucide-react';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'kofi' | null>(null);
  
  const plan = searchParams.get('plan') || 'quick-clips';
  const amount = searchParams.get('amount') || '5';
  
  const planDetails = {
    'quick-clips': {
      name: 'Quick Clips',
      price: '$5',
      duration: 'Up to 15 mins',
      delivery: '6–12 hours',
      files: '1 file max',
      description: 'Perfect for TikTok clips and highlights'
    },
    'standard-sessions': {
      name: 'Standard Sessions',
      price: '$12',
      duration: 'Up to 30 mins',
      delivery: '6–12 hours',
      files: '1–2 files',
      description: 'Best for YouTube videos and stream cuts'
    },
    'extended-content': {
      name: 'Extended Content',
      price: '$20',
      duration: 'Up to 60 mins',
      delivery: '12–24 hours',
      files: '1–2 files',
      description: 'Ideal for full episodes and long streams'
    },
    'marathon-streams': {
      name: 'Marathon Streams',
      price: '$35',
      duration: 'Up to 2 hours',
      delivery: '24–48 hours',
      files: '1 file max',
      description: 'Perfect for full VOD sessions'
    }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails['quick-clips'];

  const handlePayment = async (method: 'paypal' | 'kofi') => {
    setIsProcessing(true);
    setSelectedMethod(method);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Your ${currentPlan.name} order has been confirmed. We'll start processing your subtitles immediately.`,
      });
      
      // Redirect to success page or dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex justify-center mb-8">
          <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Order Summary
              </CardTitle>
              <CardDescription>
                Review your selected plan and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {currentPlan.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-3">
                  {currentPlan.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{currentPlan.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>{currentPlan.delivery}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Gaming-aware context translation</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Cultural nuances preserved</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Native speaker quality</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Free preview included</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-2xl text-blue-600">{currentPlan.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Choose your preferred payment option
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PayPal Option */}
              <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedMethod === 'paypal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <Button
                  onClick={() => handlePayment('paypal')}
                  disabled={isProcessing}
                  className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white py-3 text-lg transition-all duration-200 hover:scale-105"
                >
                  {isProcessing && selectedMethod === 'paypal' ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                        alt="PayPal" 
                        className="h-6 w-auto"
                      />
                      Pay with PayPal
                    </div>
                  )}
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Secure payment via PayPal
                </p>
              </div>

              {/* Ko-fi Option */}
              <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedMethod === 'kofi' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <Button
                  onClick={() => handlePayment('kofi')}
                  disabled={isProcessing}
                  className="w-full bg-[#29abe0] hover:bg-[#1e8bb8] text-white py-3 text-lg transition-all duration-200 hover:scale-105"
                >
                  {isProcessing && selectedMethod === 'kofi' ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pay with Ko-fi
                    </div>
                  )}
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Support creators and pay securely
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>Your payment is secure and encrypted</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  We don't store your payment information
                </p>
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>💡 Remember: You only pay after approving your free preview!</p>
                <p className="mt-1">Questions? Contact us before paying.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Secure & Protected
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your payment is processed securely. We use industry-standard encryption to protect your information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
