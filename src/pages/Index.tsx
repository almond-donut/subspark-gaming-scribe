import { useState, useEffect } from 'react';
import { Moon, Sun, Play, Check, Star, Globe, Clock, Shield, ArrowRight, Zap, Users, Award, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import useSubscription from '@/hooks/use-subscription';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const { hasValidSubscription, hasCreditsRemaining, validateAndUseCredit } = useSubscription();
  const [formData, setFormData] = useState({
    video_link: '',
    media_type: 'video', // Default to video, but can be audio as well
    source_language: 'korean',
    context_tones: [] as string[],
    email: '',
    notes: ''
  });
  const { toast } = useToast();
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Populate email field if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user]);const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video_link || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your media link and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Determine if this is a free preview or a paid request
      const isPaidRequest = user && hasValidSubscription;
      let paymentStatus = 'pending';
      let requestStatus = 'submitted';
      
      // If user is logged in and using a credit from their subscription
      if (isPaidRequest) {
        // Validate and use a credit from their subscription
        const creditUsed = await validateAndUseCredit();
        if (!creditUsed) {
          setIsSubmitting(false);
          return; // Stop if credit validation failed
        }
        
        paymentStatus = 'paid';
        requestStatus = 'in_progress'; // Paid requests go directly to processing
      }
      
      const { error } = await supabase
        .from('requests')
        .insert({
          video_link: formData.video_link,
          source_language: formData.source_language,
          context_tones: formData.context_tones,
          email: formData.email,
          notes: formData.notes,
          status: requestStatus,
          payment_status: paymentStatus,
          user_id: user?.id || null // Link to user if authenticated
        });
        
      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Submission Error",
          description: "There was an error submitting your request. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      setIsSubmitting(false);
      setSubmitted(true);
      
      if (isPaidRequest) {
        toast({
          title: "Request Submitted Successfully!",
          description: "Your paid request has been submitted and is being processed with priority. You'll receive your subtitle package soon!",
        });
      } else {
        toast({
          title: "Request Submitted Successfully!",
          description: "Your FREE English SRT preview with basic translation will be ready in 6-12 hours. Check your email!",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleToneChange = (tone: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        context_tones: [...prev.context_tones, tone]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        context_tones: prev.context_tones.filter(t => t !== tone)
      }));
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 py-4">            <div className="flex items-center justify-between">              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 flex items-center justify-center">
                  <img src="/vodscribe-logo-new.png" alt="Vodscribe Logo" className="h-full object-contain" />
                </div>                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                    VODSCRIBE
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                    Contextual JP/KR/CN Translation & Subtitles
                  </span>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => scrollToSection('hero')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How it Works
                </button>                <button onClick={() => scrollToSection('pricing')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact
                </button>
              </nav>              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Button 
                  onClick={() => scrollToSection('order-form')} 
                  variant="outline"
                  className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                >
                  Get Free Sample
                </Button>
                <Button 
                  onClick={() => window.location.href = '/payment?plan=quickclips&amount=11.99'} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Order Subtitles
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'} 
                  variant="ghost"
                  className="hidden md:flex"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  variant="outline"
                  className="hidden md:flex"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="hero" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                From Asian Dialogue to Global Subtitles,<br />
                <span className="text-3xl md:text-4xl">Powered by AI Context & Human-Crafted Translation</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Professional subtitles for Korean, Japanese & Chinese content — transcribed, translated, and localized for global audiences. 
                Designed for streamers, podcasters, and anime/gaming creators who care about meaning, not just words.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => scrollToSection('order-form')} 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                >
                  Start Your Subtitle <ArrowRight className="ml-2 w-5 h-5" />
                </Button>                <div className="text-sm text-slate-500 dark:text-slate-400">
                  ✨ FREE preview sample • $5 for full subtitles • No login required
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/50 dark:bg-slate-900/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                Why Creators Choose Us
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                We don't just translate words - we capture the energy, context, and culture that makes your content special.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Gaming Context Aware</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    Understands gaming slang, reactions, and cultural nuances that automated tools miss.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Cultural Translation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    Not just words, but meaning and vibes. Perfect for Korean, Japanese & Chinese content.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Fast Turnaround</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    6-12 hours delivery via email. Perfect for time-sensitive content and quick uploads.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Multiple Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">
                    SRT files ready for any platform. YouTube, Twitch, TikTok - we've got you covered.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>        {/* Why VODSCRIBE is Different Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
          <div className="container mx-auto">
            <div className="text-center mb-8">              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                🔥 VOD & Audio Subtitle Service vs Competitors
              </h2>
              <p className="text-xl font-semibold text-purple-300">Game Changer Alert!</p>
              <div className="max-w-3xl mx-auto mt-6">
                <div className="mb-6 text-xl md:text-2xl font-light leading-relaxed space-y-6">
                  <p>We don't do subtitles.</p>
                  <p>We deliver culture, jokes, memes, emotions, and reactions — in perfect English.</p>
                  <p>For streamers, by someone who gets it.</p>
                </div>
                  <div className="text-center mb-8">
                  <p className="text-xl font-semibold italic">
                    "Otter transcribes meetings.<br />
                    We subtitle videos AND audio across the internet."
                  </p>
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">              <h3 className="text-2xl font-bold mb-8 text-center">
                🚀 <span>Our Unique Advantages</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Advantage 1 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-purple-500">
                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">🎮</span> Gaming Context Master
                  </h4>                  <ul className="space-y-2">
                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>Gaming slang, cultural references, streamer language</span>
                    </li><li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>Generic, robotic translations that don't understand "Pog", "based", "cringe"</span>
                    </li>
                  </ul>
                </div>
                
                {/* Advantage 2 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-blue-500">
                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">🧠</span> Human-AI Hybrid Approach
                  </h4>                  <ul className="space-y-2">
                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>Manual QC + AI efficiency = best of both worlds</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>Pure automation (soulless) OR pure manual (slow & expensive)</span>
                    </li>
                  </ul>
                </div>
                
                {/* Advantage 3 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-yellow-500">
                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">⚡</span> Speed Demon
                  </h4>                  <ul className="space-y-2">                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>6-12 hours turnaround</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>3-7 days or real-time but poor quality</span>
                    </li>
                  </ul>
                </div>
                
                {/* Advantage 4 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-green-500">
                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">🌏</span> Cultural Translation
                  </h4>                  <ul className="space-y-2">                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>Understand context, jokes, memes from different cultures</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>Literal translations that are extremely awkward</span>
                    </li>
                  </ul>
                </div>
                  {/* Advantage 5 */}                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-pink-500">                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">🎬</span> Triple SRT Package
                  </h4>                  <ul className="space-y-2">                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>Three SRT files: Original language, English translation, and dual language combined. Maximum flexibility!</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>Single language only or raw transcription without context</span>
                    </li>
                  </ul>
                </div>
                
                {/* Advantage 6 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-indigo-500">
                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">💎</span> Affordable Premium
                  </h4>                  <ul className="space-y-2">                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>$12 for quality + speed</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>$50+ professional services OR $5 but terrible results</span>
                    </li>
                  </ul>
                </div>
                
                {/* Advantage 7 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-orange-500">
                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">💳</span> Flexible Payment
                  </h4>
                  <ul className="space-y-2">                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>PayPal + Ko-fi + Wise (creator-friendly)</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>Corporate payment systems only</span>
                    </li>
                  </ul>
                </div>
                
                {/* Advantage 8 */}
                <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border-l-4 border-cyan-500">                  <h4 className="font-bold text-xl mb-3 flex items-center">
                    <span className="mr-2">🎣</span> Preview Hook
                  </h4>
                  <ul className="space-y-2">                    <li className="flex">
                      <span className="text-purple-300 font-bold mr-2">We:</span>
                      <span>Free 10-min English SRT sample → $5 for full subtitles with all three SRT files</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-400 font-bold mr-2">Others:</span>
                      <span>All-or-nothing pricing</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-900/30 rounded-xl p-6 backdrop-blur-sm border border-purple-400/30 text-center mb-10">
                <h4 className="font-bold text-xl mb-4 tracking-wide">🎯 Our Positioning</h4>
                <p className="text-2xl font-bold mb-4 text-purple-200">
                  "Premium Quality, Indie Speed, Gamer Soul"
                </p>
                <p className="text-base">
                  <span className="font-semibold text-purple-300">Competitors can't replicate:</span> Our personal touch + gaming expertise + cultural understanding + sustainable pricing model!
                </p>
                <p className="mt-4 text-lg font-semibold text-white">
                  We're not just competing - we're creating a new category! 🏆
                </p>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => scrollToSection('order-form')} 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 border-0"
                >
                  Try It Free
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4">
          <div className="container mx-auto">            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                How It Works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Simple, transparent process designed for content creators who need quality fast.
              </p>              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg max-w-2xl mx-auto mt-4">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  <span className="font-bold">🌐 Premium SRT Package:</span> You'll receive <span className="font-bold">three SRT files</span> - the original language <span className="font-semibold">(KR/JP/CN)</span>, professional English translation, <span className="font-bold">plus</span> a dual language version containing both languages together. Perfect for all viewer preferences!
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Submit Your Media</h3>                <p className="text-slate-600 dark:text-slate-300">
                  Share your video or audio link & details. <strong>100% FREE</strong> to start - no payment or account required.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Get Preview Sample</h3>                <p className="text-slate-600 dark:text-slate-300">
                  Receive a free English SRT preview with basic translation in 6-12 hours via email. No context translation yet!
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Ready for Context-Aware Translation?</h3>                <p className="text-slate-600 dark:text-slate-300">
                  Pay just $5 to upgrade to full context-aware translation. Unlock all three SRT files with our specialized gaming translation!
                </p>
              </div>              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Receive Three SRT Files</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Get all three SRT files: original language <span className="font-semibold">(KR/JP/CN)</span>, translated English, and dual language combined within 2 hours of payment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="py-20 px-4 bg-white/50 dark:bg-slate-900/50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                Start Your Subtitle Request
              </h2>              <p className="text-lg text-slate-600 dark:text-slate-300">
                Get your FREE English SRT preview with basic translation in 6-12 hours. No payment required to start!
              </p>
            </div>

            {!submitted ? (
              <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">                <CardHeader>
                  <CardTitle className="text-center text-slate-800 dark:text-slate-100">
                    Request Form
                  </CardTitle>
                  <div className="mt-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 rounded-md p-2 flex justify-center items-center">
                    <span className="text-green-700 dark:text-green-300 text-sm font-medium">🔓 No login or account creation required - Get started instantly!</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">                    <div>
                      <Label className="text-slate-700 dark:text-slate-200 mb-3 block">
                        Media Type *
                      </Label>
                      <RadioGroup                        value={formData.media_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value }))}
                        className="flex space-x-4 mb-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="video" id="video" />
                          <Label htmlFor="video" className="text-slate-600 dark:text-slate-300">🎬 Video</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="audio" id="audio" />
                          <Label htmlFor="audio" className="text-slate-600 dark:text-slate-300">🎵 Audio</Label>
                        </div>
                      </RadioGroup>                      <Label htmlFor="media-link" className="text-slate-700 dark:text-slate-200">
                        {formData.media_type === 'video' ? 'Video Link *' : 'Audio Link *'}
                      </Label>
                      <Input
                        id="media-link"
                        type="url"
                        placeholder={formData.media_type === 'video' ? 
                          "YouTube, Google Drive, Dropbox, etc." : 
                          "Google Drive, Dropbox, OneDrive, etc."}
                        value={formData.video_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_link: e.target.value }))}
                        className="mt-1"
                        required
                      />                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        1-2 files max, 30 minutes each ({formData.media_type === 'video' ? 
                          'MP4, MOV, etc.' : 
                          'MP3, WAV, FLAC, etc.'})
                      </p>
                      <div className="flex items-center mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-xs text-amber-800 dark:text-amber-300">
                          Make sure to provide a <strong>public link</strong> that our team can access without permission requests.
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-700 dark:text-slate-200 mb-3 block">
                        Source Language *
                      </Label>
                      <RadioGroup                        value={formData.source_language} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, source_language: value }))}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="korean" id="korean" />
                          <Label htmlFor="korean" className="text-slate-600 dark:text-slate-300">🇰🇷 Korean</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="japanese" id="japanese" />
                          <Label htmlFor="japanese" className="text-slate-600 dark:text-slate-300">🇯🇵 Japanese</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="chinese" id="chinese" />
                          <Label htmlFor="chinese" className="text-slate-600 dark:text-slate-300">🇨🇳 Chinese</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-slate-700 dark:text-slate-200 mb-3 block">
                        Context Tone (select all that apply)
                      </Label>
                      <div className="space-y-2">
                        {['Gaming', 'Casual', 'Playful'].map((tone) => (
                          <div key={tone} className="flex items-center space-x-2">
                            <Checkbox
                              id={tone.toLowerCase()}                              checked={formData.context_tones.includes(tone.toLowerCase())}
                              onCheckedChange={(checked) => handleToneChange(tone.toLowerCase(), checked as boolean)}
                            />
                            <Label htmlFor={tone.toLowerCase()} className="text-slate-600 dark:text-slate-300">
                              {tone}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                        required
                      />                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        We'll send your preview sample here
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">
                        Additional Notes (Optional)
                      </Label>                      <Textarea
                        id="notes"
                        placeholder="Any specific context, slang, or instructions for the subtitles..."                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />                      <div className="mt-2 text-xs flex items-center text-slate-500 dark:text-slate-400">
                        <span className="italic">Your notes will be reviewed during the subtitle creation process</span>
                      </div>
                    </div>                    {user && hasValidSubscription ? (
                      <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          💎 Paid Subscription Active
                        </h3>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>✓ Full file processing (complete content)</li>
                          <li>✓ Priority processing (6 hours or less)</li>
                          <li>✓ Korean/Japanese/Chinese → English</li>
                          <li>✓ All three SRT files (Original, English, and Dual)</li>
                          <li>✓ Full context-aware translation</li>
                          <li>✓ Credits remaining: {hasCreditsRemaining ? "Yes" : "No"}</li>
                          <li className="pt-2 text-green-800 dark:text-green-200">This request will use 1 credit from your subscription</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          💎 FREE Preview Sample
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>✓ First 10 minutes of your content (up to 30 min total)</li>
                          <li>✓ Processing within 6 hours</li>
                          <li>✓ Korean/Japanese/Chinese → English</li>
                          <li>✓ English SRT file only (translated subtitles)</li>
                          <li>✓ Basic translation (no context translation)</li>
                          <li>✓ No payment required for preview</li>
                          <li>✓ No login or account creation needed</li>
                          <li className="pt-2 text-blue-800 dark:text-blue-200">Upgrade for full context-aware subtitles starting at $4.99!</li>
                        </ul>
                      </div>
                    )}<Button 
                      type="submit" 
                      className={`w-full text-lg py-3 ${
                        user && hasValidSubscription 
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      }`}
                      disabled={isSubmitting || (user && hasValidSubscription && !hasCreditsRemaining)}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing your request...
                        </>
                      ) : user && hasValidSubscription ? (
                        <>Submit Paid Request</>
                      ) : (
                        <>Get FREE Preview Sample</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (              <Card className="border-green-200 dark:border-green-700 bg-green-50/80 dark:bg-green-950/80">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-200">
                    Request Submitted Successfully!
                  </h3>
                  
                  {user && hasValidSubscription ? (
                    <>
                      <p className="text-green-700 dark:text-green-300 mb-3 text-lg">
                        Thanks! Your FULL subtitle package is being processed with priority. You'll receive all three SRT files (Original, English, and Dual) in your email soon!
                      </p>
                      <div className="mb-3 text-amber-600 dark:text-amber-400 text-sm">
                        <span>Your request has been assigned to a gaming language specialist</span>
                      </div>
                      <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          🕒 You are #1 in queue for priority processing
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-200 font-semibold">
                          💎 View your request status in your dashboard
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/dashboard'} 
                          variant="outline"
                          className="mt-3"
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-green-700 dark:text-green-300 mb-3 text-lg">
                        Thanks! Your FREE preview sample will be ready in 6-12 hours. We'll email your English SRT file with translated subtitles when it's ready!
                      </p>
                      <div className="mb-3 text-amber-600 dark:text-amber-400 text-sm">
                        <span>Your request has been assigned to a gaming language specialist</span>
                      </div>
                      <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          🕒 You are #4 in queue for preview processing
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-200 font-semibold">
                          💎 Love your preview? Complete your first file for just $4.99!
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Then choose from our Quick Clips ($11.99), or Creator Pro ($44.99) plans for maximum value.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>        </section>        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-900 text-white text-center">          <h2 className="text-4xl font-bold mb-2">Choose Your Subtitle Plan</h2>
          <p className="text-lg text-gray-300 mb-6">Find the perfect tier for your streaming and content needs</p>
          
          {/* Core Features */}
          <div className="max-w-3xl mx-auto mb-10">
            <h3 className="text-xl font-semibold mb-4">Premium Features Included in All Paid Plans:</h3>            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">✅ Gaming Context Aware</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">✅ Multiple Languages (JP/KR/CN)</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">✅ Fast Turnaround</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">✅ VOD Optimized</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">✅ Cultural Translation</span>
              <span className="bg-purple-800 px-3 py-1 rounded-full text-sm">✅ Three SRT Files Package</span>
              <span className="bg-green-800 px-3 py-1 rounded-full text-sm">✅ No Login Required</span>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-800/30 rounded-lg p-3 mt-4 max-w-xl mx-auto">
              <p className="text-blue-300 text-sm">
                <span className="font-bold">🔍 Price Comparison:</span> Similar services charge $30-50 per hour of content with single language only!
              </p>
            </div>
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">            {/* Free Preview */}
            <div className="border border-gray-500 rounded-xl p-6 bg-gray-800 shadow-lg hover:shadow-gray-500/20 transition-all duration-300">
              <div className="bg-gray-700 rounded-full w-fit px-3 py-0.5 text-xs mx-auto mb-2">FREE</div>
              <h3 className="text-xl font-semibold mb-2">Sample Preview</h3>
              <p className="text-2xl font-bold text-gray-300 mb-2">$0</p>              <ul className="text-sm text-gray-300 text-left space-y-1">
                <li>📁 1 file for preview (video or audio)</li>
                <li>⏱️ Max 30 minutes duration</li>
                <li>🎬 Output: First 10 minutes only</li>                <li>🕒 Processing: 6 hours max</li>
                <li>🔄 English SRT file only (translated subtitles)</li>
                <li>🔐 No login or account creation needed</li>
                <li className="text-gray-400 mt-2 italic">Try before you buy - basic translation only</li>
              </ul><div className="mt-3 bg-purple-900/30 rounded p-2 text-xs text-purple-300">
                Upgrade to full 30-min context-aware subtitles with all three SRT files for just $4.99
              </div>
            </div>            {/* Preview Upgrade */}
            <div className="border border-purple-300 rounded-xl p-6 bg-gray-800 shadow-lg hover:shadow-purple-300/20 transition-all duration-300">
              <div className="bg-purple-800/50 rounded-full w-fit px-3 py-0.5 text-xs mx-auto mb-2">STARTER</div>
              <h3 className="text-xl font-semibold mb-2">Preview Upgrade</h3>
              <p className="text-2xl font-bold text-purple-300 mb-2">$4.99</p>
              <ul className="text-sm text-gray-300 text-left space-y-1">
                <li>📁 Up to 2 files per month</li>
                <li>⏱️ Max 30 minutes per file</li>
                <li>🎬 Complete file (full content)</li>                <li>🕒 Processing: 6-12 hours</li>
                <li>🔄 Three SRT files (Original, English, & Dual)</li>
                <li className="text-gray-400 mt-2 italic">Affordable entry option for casual uploads</li>
              </ul>              <div className="mt-4 mb-1">
                <Button 
                  onClick={() => {
                    // Redirect to auth first if this is a paid plan that requires login
                    window.location.href = '/auth?redirect=payment&plan=starter&amount=4.99';
                  }} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Select Plan
                </Button>
              </div>
              <div className="mt-2 pt-2 border-t border-purple-300/10">
                <div className="flex items-center justify-center">
                  <span className="text-[10px] text-gray-400">Only $2.50 per file when using both credits</span>
                </div>
              </div>
            </div>            {/* Quick Clips */}
            <div className="border border-purple-500 rounded-xl p-6 bg-gray-800 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-1 -right-12 bg-purple-600 text-xs py-1 px-10 transform rotate-45 z-10">
                MOST POPULAR
              </div>
              <div className="bg-purple-700 rounded-full w-fit px-3 py-0.5 text-xs mx-auto mb-2">🔥 WEEKLY RESET</div>
              <h3 className="text-xl font-semibold mb-2">Quick Clips</h3>
              <p className="text-2xl font-bold text-purple-400 mb-2">$11.99</p>
              <ul className="text-sm text-gray-300 text-left space-y-1">                <li>📁 1-2 files <span className="font-bold text-purple-300">per week</span> (4-8 monthly)</li>
                <li>⏱️ <span className="font-bold text-purple-300">Max 90 minutes</span> per file (3x longer)</li>
                <li>🎬 Complete file (full content)</li>                <li>🕒 <span className="font-bold text-purple-300">Priority processing: 6 hours max</span></li>
                <li>🔄 Three SRT files (Original, English, & Dual)</li>
                <li className="text-gray-400 mt-2 italic">Perfect for most VOD & Podcast</li>
              </ul>              <div className="mt-4">
                <Button 
                  onClick={() => {
                    // Redirect to auth first if this is a paid plan that requires login
                    window.location.href = '/auth?redirect=payment&plan=quickclips&amount=11.99';
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Buy Now
                </Button>
              </div>
              <div className="mt-2 border-t border-purple-400/20 pt-2">
                <div className="flex items-center justify-center text-[10px] text-purple-300">
                  <span>Only $1.50 per file • 3x longer videos • Weekly refresh</span>
                </div>
              </div>
            </div>            {/* Creator Pro */}
            <div className="border border-yellow-500 rounded-xl p-6 bg-gray-800 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-1 -right-12 bg-yellow-600 text-xs py-1 px-10 transform rotate-45 z-10">
                BEST VALUE
              </div>
              <div className="bg-yellow-600/50 rounded-full w-fit px-3 py-0.5 text-xs mx-auto mb-2">UNLIMITED</div>
              <h3 className="text-xl font-semibold mb-2">Creator Pro</h3>
              <p className="text-2xl font-bold text-yellow-400 mb-2">$44.99</p>              <ul className="text-sm text-gray-300 text-left space-y-1">
                <li>📁 <span className="font-bold text-yellow-300">50 files per month</span> (video or audio)</li>
                <li>⏱️ <span className="font-bold text-yellow-300">Max 180 minutes</span> per file (6x longer)</li>
                <li>🎬 Complete file (full content)</li>                <li>🕒 <span className="font-bold text-yellow-300">VIP Priority: 6-12 hours</span></li>
                <li>🔄 Three SRT files (Original, English, & Dual)</li>
                <li className="text-yellow-300">+ Priority Processing + Bulk Orders</li>
                <li className="text-gray-400 mt-2 italic">Perfect for Content Creators & Streamers</li>
              </ul>              <div className="mt-4">
                <Button 
                  onClick={() => {
                    // Redirect to auth first if this is a paid plan that requires login
                    window.location.href = '/auth?redirect=payment&plan=creatorpro&amount=44.99';
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                >
                  Buy Now
                </Button>
              </div>
              <div className="mt-3 border-t border-yellow-400/20 pt-2">
                <div className="flex items-center justify-center text-[10px] text-yellow-300">
                  <Shield className="w-2 h-2 mr-1" /> Less than $1 per file • Dedicated Expert Team
                </div>
              </div>
            </div>
          </div>          {/* Value Comparison */}
          <div className="mt-12 max-w-2xl mx-auto bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">Why Our Users Choose Quick Clips ($11.99)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">Perfect for Weekly Content</h4>
                <p className="text-sm text-gray-300">Upload 1-2 videos every week and always have fresh credits available, unlike monthly plans that can be used up quickly.</p>
              </div>
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">Better Value Than Starter</h4>
                <p className="text-sm text-gray-300">At just <span className="font-bold">$1.50 per file</span> (vs. $2.50) and <span className="font-bold">3x longer</span> video support, you get more value for your money.</p>
              </div>
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">Faster Processing</h4>
                <p className="text-sm text-gray-300">Get your subtitles back in 6 hours max vs. 12+ hours with other plans. Perfect for time-sensitive uploads.</p>
              </div>
              <div className="bg-gray-800/80 p-4 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">Most Flexible Option</h4>
                <p className="text-sm text-gray-300">Weekly resets mean you're never waiting a whole month for new credits - perfect for content creators with regular schedules.</p>
              </div>
            </div>
          </div>          {/* Payment Methods */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Secure Payment Methods</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex flex-col items-center bg-blue-800/20 p-4 rounded-lg border border-blue-800/30 w-36">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-full mb-2">
                  <span className="text-white font-bold text-sm">PayPal</span>
                </div>
                <span className="text-sm text-gray-300 font-medium">PayPal</span>
                <span className="text-xs text-gray-400 mt-1 text-center">Fast and secure online payment</span>
              </div>
              
              <div className="flex flex-col items-center bg-cyan-800/20 p-4 rounded-lg border border-cyan-800/30 w-36">
                <div className="w-12 h-12 flex items-center justify-center bg-[#29abe0] rounded-full mb-2">
                  <span className="text-white text-lg">☕</span>
                </div>
                <span className="text-sm text-gray-300 font-medium">Ko-fi</span>
                <span className="text-xs text-gray-400 mt-1 text-center">Support creators directly</span>
              </div>
              
              <div className="flex flex-col items-center bg-green-800/20 p-4 rounded-lg border border-green-800/30 w-36">
                <div className="w-12 h-12 flex items-center justify-center bg-[#4cc8ff] rounded-full mb-2">
                  <span className="text-white font-bold text-sm">Wise</span>
                </div>
                <span className="text-sm text-gray-300 font-medium">Wise</span>
                <span className="text-xs text-gray-400 mt-1 text-center">International bank transfers</span>
              </div>
            </div>          
            <div className="mt-8 text-center">
              <span className="bg-gray-800 px-4 py-1.5 rounded-full text-sm text-gray-300 inline-flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-400" /> No credit cards needed
              </span>
            </div>
            
            <p className="mt-6 text-xs text-gray-400 italic max-w-lg mx-auto text-center">
            All processing done manually with AI assistance to ensure gaming context accuracy and cultural nuance.
            </p>
          </div><div className="mt-6 max-w-xl mx-auto bg-yellow-900/20 border border-yellow-900/30 rounded p-3">
            <p className="text-yellow-200 text-sm">
              <span className="font-bold">💡 Pro tip:</span> Need more than 50 files per month? Contact us for enterprise pricing and custom solutions!
            </p>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4 bg-white/50 dark:bg-slate-900/50">
          <div className="container mx-auto">            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                Trusted by Content Creators Worldwide
              </h2>
              <div className="inline-flex items-center px-3 py-1 mb-4 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/30 rounded-full">
                <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400 mr-1" />
                <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">All testimonials from carefully reviewed subtitle projects</span>
              </div>
              <div className="flex justify-center space-x-4 mb-8">
                <div className="text-2xl">🇰🇷</div>
                <div className="text-2xl">🇯🇵</div>
                <div className="text-2xl">🇨🇳</div>
                <div className="text-2xl">🇺🇸</div>
                <div className="text-2xl">🇬🇧</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    "Finally, subtitles that get the gaming context right! Perfect for my Korean gameplay clips."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      A
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Alex Chen</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Gaming Streamer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    "Super fast turnaround and they actually understand the cultural nuances. Worth every penny!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Maria Santos</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Anime Content Creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    "The free preview was good, but upgrading to the full context-aware translation was game-changing. All three SRT files made my workflow so much easier!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      R
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Ryan Kim</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">YouTube Creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>              <div className="text-center">
              <div className="flex justify-center items-center space-x-8 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-300">500+ Creators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-slate-600 dark:text-slate-300">1000+ Subtitles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-slate-600 dark:text-slate-300">4.9/5 Rating</span>
                </div>
              </div>            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 bg-slate-100 dark:bg-slate-800/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Everything you need to know about our subtitle service
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  What languages do you support?
                </AccordionTrigger>                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  We currently support Korean, Japanese, and Chinese as source languages, with English as the translation language. Free previews include only the English SRT file with basic translation. Paid plans include all three SRT files: the original language SRT, the English translation SRT, and a dual language SRT that combines both languages with full context-aware translation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  How long does it take to get my subtitles?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  Free previews are delivered within 6-12 hours. After purchasing a plan, full subtitles are typically delivered within 6 hours (Quick Clips plan) or 6-12 hours (other plans). Priority processing is available for Creator Pro customers.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  What's your refund policy?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  <p>We stand behind our subtitle quality. If you're not satisfied with your subtitles, you can request a refund within 7 days of delivery under the following conditions:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Major accuracy issues in the translation</li>
                    <li>Serious technical problems with the SRT files</li>
                    <li>Service not delivered as described</li>
                  </ul>
                  <p className="mt-2">To request a refund, please email us at vodscribe@proton.me with your order details and reason for the refund request. We'll review all requests within 48 hours.</p>
                  <p className="mt-2 text-sm italic">Note: Since we offer a free preview sample, we encourage all customers to try the preview before purchasing to ensure our service meets your needs.</p>
                </AccordionContent>
              </AccordionItem>
                <AccordionItem value="item-4" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  <p>We accept the following payment methods:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><span className="font-semibold">PayPal:</span> Fast and secure payment option that works in most countries</li>
                    <li><span className="font-semibold">Ko-fi:</span> Support us directly through the Ko-fi platform</li>
                    <li><span className="font-semibold">Wise:</span> For international bank transfers with low fees</li>
                  </ul>
                  <p className="mt-2">We currently do not accept credit card payments directly to keep our operations streamlined and costs down. This allows us to offer our services at more affordable rates compared to larger companies.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  What file formats do you accept?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  We accept most common video formats (MP4, MOV, AVI, etc.) and audio formats (MP3, WAV, FLAC, etc.). You can provide a link to your content via YouTube, Google Drive, Dropbox, or any other cloud storage service.
                </AccordionContent>
              </AccordionItem>
                <AccordionItem value="item-5" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  What SRT files will I receive?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  <p>With every order, you'll receive three different SRT files:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><span className="font-semibold">Original Language SRT</span> - Subtitles in the source language (Korean, Japanese, or Chinese)</li>
                    <li><span className="font-semibold">English SRT</span> - Professional English translation of the content</li>
                    <li><span className="font-semibold">Dual Language SRT</span> - Combined file with both original language and English subtitles together</li>
                  </ul>
                  <p className="mt-2">This three-file approach gives you maximum flexibility. You can use the original file for native speakers, the English file for international viewers, or the dual language file for language learners and audiences who appreciate both languages.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="px-6 text-slate-800 dark:text-slate-100 hover:no-underline">
                  Can I request revisions to my subtitles?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                  Yes! We offer one round of revisions for free with every order. If you notice any errors or have specific preferences, simply email us with your requested changes within 7 days of delivery, and we'll make the adjustments at no extra cost.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-12 text-center">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Have more questions? Contact us directly:
              </p>
              <a href="mailto:vodscribe@proton.me" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline">
                <Mail className="w-4 h-4 mr-2" />
                vodscribe@proton.me
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="py-12 px-4 bg-slate-900 dark:bg-slate-950">          <div className="container mx-auto text-center">            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center">
                <img src="/vodscribe-logo-new.png" alt="Vodscribe Logo" className="h-full object-contain filter brightness-0 invert" />
              </div>
              <span className="text-lg font-bold text-white">VODSCRIBE</span>
              <span className="text-xs text-gray-400 mt-1">®</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Contact</h3>
                <p className="text-slate-300 text-sm">vodscribe@proton.me</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Languages</h3>
                <p className="text-slate-300 text-sm">Korean • Japanese • Chinese → English</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Specialization</h3>
                <p className="text-slate-300 text-sm">Gaming • Streaming • Anime • Casual Content</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">              <p className="text-slate-400 text-sm mb-2">
                © 2025 VODSCRIBE. Built with ❤️ for creators.
              </p><p className="text-slate-500 text-xs mb-2">
                For educational/fan content use only. Gaming culture specialists.
              </p>              <div className="mt-3 flex items-center justify-center text-xs">
                <span className="text-slate-400">Premium Quality • Human Expert Review</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
