import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Home, FileText, CreditCard, Settings, LogOut, ExternalLink, Download, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Request {
  id: string;
  video_link: string;
  source_language: string;
  status: 'submitted' | 'in_progress' | 'done';
  payment_status: 'pending' | 'paid' | 'free';
  created_at: string;
  srt_link: string | null;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const { user, profile, subscription, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { section } = useParams();
  
  useEffect(() => {
    if (section) {
      setActiveTab(section);
    }
  }, [section]);
  
  useEffect(() => {
    if (user) {
      fetchUserRequests();
      // Refresh user profile and subscription data
      refreshProfile();
    }
  }, [user]);
  
  const fetchUserRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('email', user?.email)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Error Loading Data",
          description: "There was a problem loading your requests.",
          variant: "destructive",
        });
      } else {
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
  };
  
  // Calculate subscription metrics
  const creditsUsed = subscription?.credits_used || 0;
  const totalCredits = subscription?.credits_total || 0;
  const creditsRemaining = Math.max(0, totalCredits - creditsUsed);
  const usagePercentage = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;
  
  // Format subscription details
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
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
  
  const getPlanDescription = (plan: string | undefined) => {
    if (!plan) return '';
    
    switch (plan) {
      case 'free':
        return 'Basic preview translation - 1 free submission';
      case 'starter':
        return 'Enhanced preview translations - 2 submissions';
      case 'quickclips':
        return 'Quick content up to 10 minutes - 10 submissions';
      case 'creatorpro':
        return 'Professional translations up to 60 minutes - 30 submissions';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">Hello, {profile?.name || user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <Card className="col-span-12 md:col-span-3 border-slate-200 dark:border-slate-700">
            <CardContent className="p-0">
              <nav className="flex flex-col space-y-1 p-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'overview' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <Home className="h-5 w-5" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/dashboard/requests"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'requests' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  <FileText className="h-5 w-5" />
                  <span>My Requests</span>
                </Link>
                <Link
                  to="/dashboard/subscription"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'subscription' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setActiveTab('subscription')}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Subscription</span>
                </Link>
                <Link
                  to="/dashboard/settings"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'settings' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </CardContent>
          </Card>
          
          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl">Subscription Overview</CardTitle>
                    <CardDescription>Your current plan and usage status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-1">Current Plan</h3>
                        <p className="text-xl font-bold">{formatPlanName(subscription?.plan)}</p>
                        <p className="text-sm text-slate-500 mt-1">{getPlanDescription(subscription?.plan)}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-1">Start Date</h3>
                        <p className="text-xl font-bold">{formatDate(subscription?.start_date)}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-1">Credits Used</h3>
                        <p className="text-xl font-bold">{creditsUsed} / {totalCredits}</p>
                        <div className="mt-2">
                          <Progress value={usagePercentage} className="h-2" />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{creditsRemaining} credits remaining</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to="/payment">
                      <Button>
                        Upgrade Plan
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Requests</CardTitle>
                    <CardDescription>Your most recent subtitle requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Loading your requests...</div>
                    ) : requests.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="mb-4">You haven't submitted any requests yet.</p>
                        <Link to="/">
                          <Button>Submit Your First Request</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {requests.slice(0, 3).map(request => (
                          <div key={request.id} className="p-4 border rounded-lg border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium truncate max-w-xs">{request.video_link}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  <span className="inline-flex items-center mr-3">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="capitalize">{request.source_language}</span>
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  request.status === 'done' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : request.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {request.status === 'done' ? 'Completed' : 
                                    request.status === 'in_progress' ? 'In Progress' : 'Submitted'}
                                </span>
                              </div>
                            </div>
                            
                            {request.srt_link && request.status === 'done' && (
                              <div className="mt-3 flex">
                                <a 
                                  href={request.srt_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download SRT
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {requests.length > 3 && (
                          <div className="text-center mt-4">
                            <Link to="/dashboard/requests">
                              <Button variant="outline">View All Requests</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
            
            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>My Requests</CardTitle>
                  <CardDescription>All your submitted subtitle requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading your requests...</div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="mb-4">You haven't submitted any requests yet.</p>
                      <Link to="/">
                        <Button>Submit Your First Request</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map(request => (
                        <div key={request.id} className="p-4 border rounded-lg border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium truncate max-w-xs">{request.video_link}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center mr-3">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(request.created_at).toLocaleDateString()}
                                </span>
                                <span className="capitalize">{request.source_language}</span>
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                request.status === 'done' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : request.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {request.status === 'done' ? 'Completed' : 
                                  request.status === 'in_progress' ? 'In Progress' : 'Submitted'}
                              </span>
                            </div>
                          </div>
                          
                          {request.srt_link && request.status === 'done' && (
                            <div className="mt-3 flex">
                              <a 
                                href={request.srt_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download SRT
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>My Subscription</CardTitle>
                  <CardDescription>Manage your subscription and payment details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <h3 className="text-lg font-medium mb-2">Current Plan</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
                          <p className="font-medium">{formatPlanName(subscription?.plan)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                          <p className="font-medium capitalize">{subscription?.status || 'Active'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Start Date</p>
                          <p className="font-medium">{formatDate(subscription?.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">End Date</p>
                          <p className="font-medium">{subscription?.end_date ? formatDate(subscription.end_date) : 'Ongoing'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Payment Method</p>
                          <p className="font-medium capitalize">{subscription?.payment_method || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Usage</h3>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Credits Used: {creditsUsed} of {totalCredits}</span>
                          <span className="text-sm">{Math.round(usagePercentage)}%</span>
                        </div>
                        <Progress value={usagePercentage} className="h-2" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        You have {creditsRemaining} credits remaining in your current plan.
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-medium mb-4">Manage Subscription</h3>
                      <div className="flex space-x-4">
                        <Link to="/payment">
                          <Button>
                            Upgrade Plan
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Profile Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                          <p className="font-medium">{profile?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                          <p className="font-medium">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Account Created</p>
                          <p className="font-medium">{profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-medium mb-3">Security</h3>
                      <div className="space-y-4">
                        <div>
                          <Link to="/auth/reset-password">
                            <Button variant="outline">Change Password</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-medium mb-3">Account Management</h3>
                      <Button variant="destructive" onClick={handleLogout}>Sign Out</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
