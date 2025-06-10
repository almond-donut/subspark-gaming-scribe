
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, FileText, Clock, Star, CheckCircle, Loader, Globe, Users, Zap } from "lucide-react";
import CharacterIllustrations from "@/components/CharacterIllustrations";

const Index = () => {
  const [formData, setFormData] = useState({
    videoLink: "",
    sourceLanguage: "korean",
    contextTones: [] as string[],
    email: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContextToneChange = (tone: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        contextTones: [...prev.contextTones, tone]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        contextTones: prev.contextTones.filter(t => t !== tone)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Request Submitted Successfully! 🎉",
        description: "We'll send your free preview within 24 hours. Check your email!",
      });
      
      // Reset form
      setFormData({
        videoLink: "",
        sourceLanguage: "korean",
        contextTones: [],
        email: "",
        notes: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/vodscribe-logo-new.png" alt="VODSCRIBE" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VODSCRIBE
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Features
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Pricing
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                How it Works
              </button>
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Character Illustrations */}
      <section className={`relative pt-20 pb-32 px-4 overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <CharacterIllustrations className="absolute inset-0" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in">
            Professional Subtitles for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Korean, Japanese & Chinese
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Gaming-aware context, cultural nuances, and lightning-fast delivery. 
            Start with a <strong>FREE preview</strong> — no payment required upfront.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={() => scrollToSection('request-form')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg transition-all duration-200 hover:scale-105"
            >
              Get FREE Preview
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => scrollToSection('pricing')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg transition-all duration-200 hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
            Why Choose VODSCRIBE?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8 text-blue-600" />,
                title: "Gaming Context Aware",
                description: "We understand gaming terminology, streamer culture, and context-specific translations that generic services miss."
              },
              {
                icon: <Zap className="h-8 w-8 text-purple-600" />,
                title: "Lightning Fast",
                description: "6-48 hour turnaround depending on length. Perfect for content creators who need quick, quality results."
              },
              {
                icon: <Users className="h-8 w-8 text-indigo-600" />,
                title: "Cultural Accuracy",
                description: "Native speakers ensure cultural nuances, slang, and context are perfectly captured for your audience."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Updated Pricing Section */}
      <section id="pricing" className="text-center py-16 px-6 bg-gradient-to-b from-[#0c0f1c] to-[#1a1e2e] text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Simple Pricing, Powerful Subtitles</h2>
        <p className="text-gray-400 mb-6 text-sm md:text-base">Always FREE preview included — pay only when you're happy.</p>

        <div className="flex flex-wrap justify-center gap-6">
          {[
            {
              title: "Quick Clips",
              price: "$5",
              features: ["🎞 Up to 15 mins", "📁 1 file max", "⏱ 6–12 hour delivery", "🎯 Best for TikTok, highlights"]
            },
            {
              title: "Standard Sessions",
              price: "$12",
              features: ["🎞 Up to 30 mins", "📁 1–2 files", "⏱ 6–12 hour delivery", "🎯 Best for YouTube, stream cuts"]
            },
            {
              title: "Extended Content",
              price: "$20",
              features: ["🎞 Up to 60 mins", "📁 1–2 files", "⏱ 12–24 hour delivery", "🎯 Best for full episodes, long streams"]
            },
            {
              title: "Marathon Streams",
              price: "$35",
              features: ["🎞 Up to 2 hours", "📁 1 file max", "⏱ 24–48 hour delivery", "🎯 Best for full VOD sessions"]
            }
          ].map((tier, index) => (
            <div key={index} className="bg-[#131729] border border-purple-600 rounded-xl p-6 w-full md:w-64 group hover:scale-105 transition-all duration-300 hover:border-purple-400">
              <h3 className="text-xl font-semibold mb-2">{tier.title}</h3>
              <p className="text-purple-400 font-bold text-2xl mb-2">{tier.price}</p>
              <ul className="text-sm text-left text-gray-300 space-y-1">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="group-hover:text-white transition-colors duration-200">{feature}</li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate(`/payment?plan=${tier.title.toLowerCase().replace(/\s+/g, '-')}&amount=${tier.price.slice(1)}`)}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Choose Plan
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-sm text-gray-400">🆓 Free Preview Policy:</p>
          <p className="text-sm text-white">
            Tier 1–2: Middle segment preview (3–5 mins) <br />
            Tier 3–4: Multi-segment showcase (2–3 highlights)
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Submit Request",
                description: "Share your video link and context details",
                icon: <FileText className="h-6 w-6" />
              },
              {
                step: "2",
                title: "Get FREE Preview",
                description: "Receive a sample within 24 hours",
                icon: <Play className="h-6 w-6" />
              },
              {
                step: "3",
                title: "Approve & Pay",
                description: "Only pay if you're satisfied",
                icon: <CheckCircle className="h-6 w-6" />
              },
              {
                step: "4",
                title: "Full Delivery",
                description: "Get your complete subtitles",
                icon: <Clock className="h-6 w-6" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-xl font-bold">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section id="request-form" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Get Your FREE Preview
              </CardTitle>
              <CardDescription className="text-lg">
                No payment required — we'll send you a sample first!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="video-link" className="text-sm font-medium">
                    Video Link (YouTube, Twitch, Google Drive, etc.) *
                  </Label>
                  <Input
                    id="video-link"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoLink}
                    onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-language" className="text-sm font-medium">
                    Source Language *
                  </Label>
                  <select
                    id="source-language"
                    value={formData.sourceLanguage}
                    onChange={(e) => setFormData({ ...formData, sourceLanguage: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="korean">Korean</option>
                    <option value="japanese">Japanese</option>
                    <option value="chinese">Chinese (Mandarin)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Context & Tone (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Gaming/Esports",
                      "Casual/Funny",
                      "Educational",
                      "Formal/Business",
                      "Streaming/Vlog",
                      "Drama/Emotional"
                    ].map((tone) => (
                      <div key={tone} className="flex items-center space-x-2 group">
                        <Checkbox
                          id={tone}
                          checked={formData.contextTones.includes(tone)}
                          onCheckedChange={(checked) => handleContextToneChange(tone, checked as boolean)}
                          className="transition-all duration-200"
                        />
                        <Label 
                          htmlFor={tone} 
                          className="text-sm cursor-pointer group-hover:text-blue-600 transition-colors duration-200"
                        >
                          {tone}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Your Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific requirements, slang to focus on, or context we should know..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg transition-all duration-200 hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Submitting Request...
                    </div>
                  ) : (
                    <>
                      Submit Free Preview Request
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>✨ Average response time: 12-24 hours</p>
                <p>💝 No payment required until you approve the preview</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img src="/vodscribe-logo-new.png" alt="VODSCRIBE" className="h-8 w-auto" />
            <span className="text-xl font-bold">VODSCRIBE</span>
          </div>
          <p className="text-slate-400 mb-6">
            Professional subtitles for Korean, Japanese & Chinese content
          </p>
          <div className="flex justify-center space-x-6 mb-6">
            <Link to="/auth" className="text-slate-400 hover:text-white transition-colors duration-200">
              Login
            </Link>
            <button onClick={() => scrollToSection('pricing')} className="text-slate-400 hover:text-white transition-colors duration-200">
              Pricing
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-slate-400 hover:text-white transition-colors duration-200">
              How it Works
            </button>
          </div>
          <div className="text-sm text-slate-500">
            © 2024 VODSCRIBE. Professional subtitle services.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
