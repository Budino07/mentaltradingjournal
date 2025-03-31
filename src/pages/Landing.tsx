import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnalyticsSection } from "@/components/landing/AnalyticsSection";
import { AboutUsSection } from "@/components/landing/AboutUsSection";
import { WhyChooseUsSection } from "@/components/landing/WhyChooseUsSection";
import { Footer } from "@/components/landing/Footer";
import { User, ArrowRightCircle, BarChart3, Brain, Lightbulb, TrendingUp, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-x-hidden">
      <div className="fixed inset-0">
        {/* Dark base layer */}
        <div className="absolute inset-0 bg-[#1A1F2C]" />
        
        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30" />
        
        {/* Animated glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-0 -right-40 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        
        {/* Glass effect base */}
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/5 backdrop-blur-md border-b border-white/5">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Mental
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4"
                asChild
              >
                <Link to="/features">Features</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4"
                asChild
              >
                <Link to="/pricing">Pricing</Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1 sm:gap-2 text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4"
                onClick={() => navigate("/login")}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
              <Button
                className="flex items-center gap-1 sm:gap-2 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/20 backdrop-blur-sm px-2 sm:px-4"
                onClick={() => navigate("/login")}
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRightCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* New Hero Section */}
        <section className="relative pt-24 sm:pt-32 md:pt-40 min-h-[90vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="container mx-auto px-4">
            {/* Subtle badge */}
            <div className="inline-block px-4 py-1.5 mb-5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
              Elevate Your Trading
            </div>
            
            {/* Main headline - UPDATED */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto">
              Take Your Trading to the Next Level by{" "}
              <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Unlocking New Sides of You
              </span>
            </h1>
            
            {/* Subheading - UPDATED */}
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Our platform helps you understand the behaviors you've never noticed before—so you can trade with more awareness, discipline, and confidence. Track your progress, analyze your trades, and unlock your true edge.
            </p>
            
            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button
                size="lg"
                className="px-6 py-6 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20"
                onClick={() => navigate("/login")}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-6 border-gray-700 hover:bg-gray-800/50 text-white"
                onClick={() => navigate("/features")}
              >
                View Features
              </Button>
            </div>
            
            {/* Dashboard preview image */}
            <div className="relative mt-16 max-w-5xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur-sm opacity-70"></div>
              <div className="relative bg-[#1A1F2C]/80 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="/lovable-uploads/2d5aff3d-084a-4b65-958f-3fa50c7b0c39.png"
                  alt="Mental Trading Dashboard"
                  className="w-full h-auto rounded-lg transform hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Redesigned Second Section - Features */}
        <section className="relative py-20 md:py-28">
          <div className="container mx-auto px-4">
            {/* Header - UPDATED */}
            <div className="text-center mb-14">
              <div className="inline-block px-4 py-1.5 mb-4 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
                The Truth
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                You're Focused on the <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Wrong Thing.</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Technicals alone is not enough to create breakthroughs, you must understand how your emotional states directly impact how you interpret market movement. Our journal shows you exactly how your emotions can make or break your trading performance in a way no other trading journal has ever done.
              </p>
            </div>

            {/* Three Premium Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1 - Emotional Intelligence */}
              <Card className="bg-gradient-to-br from-[#1E2235]/80 to-[#2A2F45]/80 border border-white/10 backdrop-blur-md shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors duration-300">
                      <Brain className="w-6 h-6 text-primary-light" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Emotional Intelligence</h3>
                    <p className="text-gray-300">
                      Track how emotions affect your trading decisions and learn to master your psychological responses to market movements.
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="emotional-stats" className="border-b-0">
                        <AccordionTrigger className="text-sm font-medium text-white/70 py-2 hover:text-primary-light no-underline hover:no-underline">
                          Key emotional metrics
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-white/60">
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-primary-light mr-2"></div>
                              <span>Emotional stability score</span>
                            </li>
                            <li className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                              <span>Fear/greed analysis</span>
                            </li>
                            <li className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                              <span>Decision confidence rating</span>
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 - Pattern Recognition */}
              <Card className="bg-gradient-to-br from-[#1E2235]/80 to-[#2A2F45]/80 border border-white/10 backdrop-blur-md shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors duration-300">
                      <TrendingUp className="w-6 h-6 text-primary-light" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Pattern Recognition</h3>
                    <p className="text-gray-300">
                      Our AI automatically identifies behavioral patterns that impact your trading performance and help you develop strategies to overcome them.
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Win rate</span>
                      <span className="text-sm font-semibold text-white">72%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-light to-accent rounded-full" style={{ width: "72%" }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 mb-2">
                      <span className="text-sm text-white/60">Behavioral consistency</span>
                      <span className="text-sm font-semibold text-white">87%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-light to-accent rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3 - Advanced AI Insights */}
              <Card className="bg-gradient-to-br from-[#1E2235]/80 to-[#2A2F45]/80 border border-white/10 backdrop-blur-md shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors duration-300">
                      <Lightbulb className="w-6 h-6 text-primary-light" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">AI-Generated Insights</h3>
                    <p className="text-gray-300">
                      Get personalized recommendations to improve your psychological approach to trading based on your unique data profile.
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-3">
                      <p className="text-sm text-primary-light font-medium">
                        "Your FOMO trades show 68% lower success rate. Consider implementing a 10-minute decision rule."
                      </p>
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Updated 2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-12">
              <Button
                size="lg"
                className="px-8 py-6 bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent text-white font-medium border border-white/10 shadow-lg shadow-primary/20"
                onClick={() => navigate("/features")}
              >
                <Target className="mr-2 h-5 w-5" />
                Discover all features
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <WhyChooseUsSection />
        
        {/* Duplicate Why Choose Us Section with custom content */}
        <WhyChooseUsSection 
          badge="Community Favorites"
          title="Discover"
          titleHighlight="top features loved by our Traders"
          description="Voted by our community, these tools are game-changers, you don't want to miss this."
          useDashboardCards={true}
        />

        {/* Analytics Section */}
        <AnalyticsSection />

        {/* About Us Section */}
        <AboutUsSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
