import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthProps {
  confirmEmail?: boolean;
  resetPassword?: boolean;
}

const Auth = ({ confirmEmail = false, resetPassword = false }: AuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  
  // Extract redirect parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');
  const plan = searchParams.get('plan');
  const amount = searchParams.get('amount');
  
  // If user is already logged in, redirect to dashboard or specified redirect
  useEffect(() => {
    if (user && !confirmEmail && !resetPassword) {
      if (redirectTo === 'payment' && plan && amount) {
        navigate(`/payment?plan=${plan}&amount=${amount}`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, confirmEmail, resetPassword, redirectTo, plan, amount]);
  
  // Sign In state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password Reset state
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        setAuthError(error.message);
        return;
      }
        // Redirect to dashboard, payment page with parameters, or to the page they were trying to access
      if (redirectTo === 'payment' && plan && amount) {
        navigate(`/payment?plan=${plan}&amount=${amount}`);
      } else {
        const origin = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(origin);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    // Validate passwords match
    if (signUpData.password !== signUpData.confirmPassword) {
      setAuthError("Passwords do not match");
      setIsLoading(false);
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password strength
    if (signUpData.password.length < 6) {
      setAuthError("Password must be at least 6 characters long");
      setIsLoading(false);
      toast({
        title: "Password Too Short",
        description: "Please use a stronger password (at least 6 characters).",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error, user } = await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.name
      );
      
      if (error) {
        setAuthError(error.message);
        return;
      }
      
      if (user) {
        // Redirect to confirm email page
        navigate('/auth/confirm-email');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setAuthError('An unexpected error occurred. Please try again.');    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password reset request
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    if (!resetEmail) {
      setAuthError("Please enter your email address");
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox for instructions to reset your password.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If showing password reset confirmation screen
  if (confirmEmail) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen py-10 px-4">
        <div className="container mx-auto max-w-md">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <Mail className="h-16 w-16 text-blue-500" />
              </div>
              <p className="mb-4">We've sent a confirmation email to your inbox.</p>
              <p className="mb-6">Please click the link in the email to confirm your account.</p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate('/auth')}
              >
                Return to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // If showing password reset form
  if (resetPassword) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen py-10 px-4">
        <div className="container mx-auto max-w-md">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
          </div>
          
          {resetEmailSent ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Check Your Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center mb-6">
                  <Mail className="h-16 w-16 text-blue-500" />
                </div>
                <p className="mb-4">We've sent password reset instructions to your email.</p>
                <p className="mb-6">Click the link in the email to reset your password.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => navigate('/auth')}
                >
                  Return to Login
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Reset Your Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {authError}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm">
                <Link to="/auth" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  Return to Login
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    );
  }
  
  // Main auth form (login/register)
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-md">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex justify-center mb-6">
          <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Login to Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="signin-password" 
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {authError}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-gray-500">
                <p>Login required only for paid subscribers</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Create an Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {authError}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-gray-500">
                <p>By signing up, you agree to our Terms & Conditions</p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Free previews available without login</p>
          <p className="mt-1">Accounts required only for paid plans</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
