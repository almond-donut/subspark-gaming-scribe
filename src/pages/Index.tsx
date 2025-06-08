
import { useState, useEffect } from 'react';
import { Moon, Sun, Play, Check, Star, Globe, Clock, Shield, ArrowRight, Zap, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    videoLink: '',
    sourceLanguage: 'korean',
    contextTone: [] as string[],
    email: '',
    additionalNotes: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoLink || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your video link and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: "Request Submitted Successfully!",
        description: "Your FREE preview sample will be ready in 6-12 hours. Check your email!",
      });
    }, 2000);
  };

  const handleToneChange = (tone: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        contextTone: [...prev.contextTone, tone]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        contextTone: prev.contextTone.filter(t => t !== tone)
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
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VOD Subtitle
                </span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => scrollToSection('hero')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How it Works
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('order-form')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact
                </button>
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Button onClick={() => scrollToSection('order-form')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Generate Subtitles
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="hero" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                From Streams to Subtitles,<br />
                <span className="text-3xl md:text-4xl">Powered by AI & Human Magic</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Professional subtitles for Korean, Japanese & Chinese content with gaming-aware context. 
                Perfect for streamers, content creators, and anime fans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => scrollToSection('order-form')} 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                >
                  Start Your Subtitle <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  ✨ FREE preview sample • $5 for full subtitles
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
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                How It Works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Simple, transparent process designed for content creators who need quality fast.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Submit Your Video</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Share your video link & details. <strong>100% FREE</strong> to start - no payment required.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Get Preview Sample</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Receive a quality preview in 6-12 hours via email. See our magic in action!
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Love the Quality?</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Pay just $5 for complete subtitles. Only pay if you're satisfied with the preview!
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Receive Full SRT</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Get your complete SRT file within 2 hours of payment. Ready to upload anywhere!
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
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Get your FREE preview sample in 6-12 hours. No payment required to start!
              </p>
            </div>

            {!submitted ? (
              <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
                <CardHeader>
                  <CardTitle className="text-center text-slate-800 dark:text-slate-100">
                    Request Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="video-link" className="text-slate-700 dark:text-slate-200">
                        Video Link *
                      </Label>
                      <Input
                        id="video-link"
                        type="url"
                        placeholder="YouTube, Google Drive, Dropbox, etc."
                        value={formData.videoLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoLink: e.target.value }))}
                        className="mt-1"
                        required
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        1-2 files max, 30 minutes each
                      </p>
                    </div>

                    <div>
                      <Label className="text-slate-700 dark:text-slate-200 mb-3 block">
                        Source Language *
                      </Label>
                      <RadioGroup 
                        value={formData.sourceLanguage} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sourceLanguage: value }))}
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
                              id={tone.toLowerCase()}
                              checked={formData.contextTone.includes(tone.toLowerCase())}
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
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        We'll send your preview sample here
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific context, slang, or instructions for the subtitles..."
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        💎 Pricing: $5 per request
                      </h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>✓ Up to 30 minutes of content</li>
                        <li>✓ 1-2 video files maximum</li>
                        <li>✓ Korean/Japanese/Chinese → English</li>
                        <li>✓ Gaming & casual tone specialization</li>
                        <li>✓ Delivered in 6-12 hours</li>
                        <li>✓ Perfect for: Anime clips, gaming highlights</li>
                      </ul>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing your request...
                        </>
                      ) : (
                        'Get FREE Preview Sample'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-green-200 dark:border-green-700 bg-green-50/80 dark:bg-green-950/80">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-200">
                    Request Submitted Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-6 text-lg">
                    Thanks! Your FREE preview sample will be ready in 6-12 hours. Check your email for a taste of our quality!
                  </p>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      🕒 You are #4 in queue for preview processing
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 font-semibold">
                      💎 Love your preview? Full subtitles just $5 via PayPal/Ko-fi
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">
              No subscriptions, no hidden fees. Pay only when you're satisfied with the quality.
            </p>

            <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-800 dark:via-blue-950/50 dark:to-purple-950/50 shadow-xl">
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">$5</div>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">Per Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Up to 30 minutes of content</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">1-2 video files maximum</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Korean/Japanese/Chinese → English</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Gaming & casual tone specialization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Delivered in 6-12 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Perfect for: Anime clips, gaming highlights</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Payment Methods:</p>
                  <div className="flex justify-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 px-4 py-2 rounded-lg text-blue-700 dark:text-blue-300 font-medium">
                      PayPal
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/50 px-4 py-2 rounded-lg text-red-700 dark:text-red-300 font-medium">
                      Ko-fi
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4 bg-white/50 dark:bg-slate-900/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                Trusted by Content Creators Worldwide
              </h2>
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
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    "The preview sample sold me immediately. Quality is way better than automated tools."
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
            </div>

            <div className="text-center">
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
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-slate-900 dark:bg-slate-950">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-bold text-white">VOD Subtitle</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Contact</h3>
                <p className="text-slate-300 text-sm">subtitles@vodsubtitle.com</p>
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

            <div className="border-t border-slate-700 pt-6">
              <p className="text-slate-400 text-sm mb-2">
                © 2024 VOD Subtitle. Built with ❤️ for creators.
              </p>
              <p className="text-slate-500 text-xs">
                For educational/fan content use only. Gaming culture specialists.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
