
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Mail, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AuthProps {
  confirmEmail?: boolean;
  resetPassword?: boolean;
}

const Auth = ({ confirmEmail = false, resetPassword = false }: AuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
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
  
  // Sign Up state with validation
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Form validation states
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password Reset state
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        errors.name = value.length < 2 ? 'Name must be at least 2 characters' : '';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        errors.email = !emailRegex.test(value) ? 'Please enter a valid email address' : '';
        break;
      case 'password':
        errors.password = value.length < 6 ? 'Password must be at least 6 characters' : '';
        setPasswordStrength(calculatePasswordStrength(value));
        break;
      case 'confirmPassword':
        errors.confirmPassword = value !== signUpData.password ? 'Passwords do not match' : '';
        break;
    }
    
    setValidationErrors(errors);
  };

  // Handle sign in with enhanced UX
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
      
      // Success feedback
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });

      // Redirect logic
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
  
  // Handle sign up with enhanced validation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    // Validate all fields
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      setIsLoading(false);
      toast({
        title: "Please fix the errors",
        description: "Check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      setAuthError("Please accept the terms and conditions");
      setIsLoading(false);
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
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account.",
        });
        navigate('/auth/confirm-email');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
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

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ strength }: { strength: number }) => {
    const getColor = () => {
      if (strength < 25) return 'bg-red-500';
      if (strength < 50) return 'bg-orange-500';
      if (strength < 75) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getLabel = () => {
      if (strength < 25) return 'Weak';
      if (strength < 50) return 'Fair';
      if (strength < 75) return 'Good';
      return 'Strong';
    };

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Password strength</span>
          <span className={`font-medium ${strength >= 75 ? 'text-green-600' : strength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {getLabel()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${strength}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Email confirmation page
  if (confirmEmail) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen py-10 px-4">
        <div className="container mx-auto max-w-md">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
          </div>
          
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-center">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <Mail className="h-16 w-16 text-blue-500 animate-pulse" />
              </div>
              <p className="mb-4">We've sent a confirmation email to your inbox.</p>
              <p className="mb-6">Please click the link in the email to confirm your account.</p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
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
  
  // Password reset page
  if (resetPassword) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen py-10 px-4">
        <div className="container mx-auto max-w-md">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
          </div>
          
          {resetEmailSent ? (
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="text-center">Check Your Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center mb-6">
                  <Mail className="h-16 w-16 text-blue-500 animate-pulse" />
                </div>
                <p className="mb-4">We've sent password reset instructions to your email.</p>
                <p className="mb-6">Click the link in the email to reset your password.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                  onClick={() => navigate('/auth')}
                >
                  Return to Login
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="animate-scale-in">
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
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="h-4 w-4" />
                      {authError}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm">
                <Link to="/auth" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
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
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex justify-center mb-6">
          <img src="/vodscribe-logo-new.png" alt="VODSCRIBE Logo" className="h-12" />
        </div>
        
        <Tabs defaultValue="login" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="transition-all duration-200">Login</TabsTrigger>
            <TabsTrigger value="register" className="transition-all duration-200">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="animate-scale-in">
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
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Link to="/auth/reset-password" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input 
                        id="signin-password" 
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-me" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="h-4 w-4" />
                      {authError}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Logging in...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-gray-500">
                <p>Login required only for paid subscribers</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="animate-scale-in">
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
                      onChange={(e) => {
                        setSignUpData({...signUpData, name: e.target.value});
                        validateField('name', e.target.value);
                      }}
                      className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.name ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600 animate-fade-in">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => {
                        setSignUpData({...signUpData, email: e.target.value});
                        validateField('email', e.target.value);
                      }}
                      className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.email ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-600 animate-fade-in">{validationErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={signUpData.password}
                        onChange={(e) => {
                          setSignUpData({...signUpData, password: e.target.value});
                          validateField('password', e.target.value);
                        }}
                        className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10 ${
                          validationErrors.password ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signUpData.password && <PasswordStrengthIndicator strength={passwordStrength} />}
                    {validationErrors.password && (
                      <p className="text-sm text-red-600 animate-fade-in">{validationErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input 
                        id="confirm-password" 
                        type={showConfirmPassword ? "text" : "password"}
                        value={signUpData.confirmPassword}
                        onChange={(e) => {
                          setSignUpData({...signUpData, confirmPassword: e.target.value});
                          validateField('confirmPassword', e.target.value);
                        }}
                        className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10 ${
                          validationErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-600 animate-fade-in">{validationErrors.confirmPassword}</p>
                    )}
                    {signUpData.confirmPassword && signUpData.password === signUpData.confirmPassword && (
                      <div className="flex items-center gap-2 text-green-600 text-sm animate-fade-in">
                        <Check className="h-4 w-4" />
                        Passwords match
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="accept-terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label htmlFor="accept-terms" className="text-sm">
                      I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-800 transition-colors">Terms & Conditions</Link>
                    </Label>
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="h-4 w-4" />
                      {authError}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                    disabled={isLoading || !acceptTerms}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      'Sign Up'
                    )}
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
          <p>🆓 Free previews available without login</p>
          <p className="mt-1">Accounts required only for paid plans</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
