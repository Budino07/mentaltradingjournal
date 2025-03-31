
import React from "react";
import { Users, DollarSign, BarChart3, Zap, MessageSquare } from "lucide-react";

export const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Users,
      title: "Community-Driven Innovation",
      description: "Our founders actively engage with traders, listen to feedback, and continuously add features that matter. If you've ever wished for a tool built by traders, for traders, this is it."
    },
    {
      icon: DollarSign,
      title: "No Overpriced Extras",
      description: "Stop overpaying for features you don't use. Mental is designed with only the essentials—everything you need, nothing you don't. Get the best value in the market: $9/month or $90/year—simple, transparent pricing."
    },
    {
      icon: BarChart3,
      title: "Insights That Count",
      description: "Track what actually impacts your trading with powerful analytics that highlight your strengths and areas for improvement."
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: "Comprehensive Analysis",
      description: "Get a holistic view of your trading performance with our advanced analytics tools that combine technical and psychological data."
    },
    {
      icon: MessageSquare,
      title: "Personalized Feedback",
      description: "Experience tailored insights with our optimized analysis engine that helps you understand your trading behaviors and patterns."
    }
  ];

  return (
    <section className="py-24">
      {/* Remove background elements to blend seamlessly with previous section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left column - Title */}
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-1.5 mb-4 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
              Why Traders Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Empower Your <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Trading Journey</span>
            </h2>
          </div>

          {/* Right column - Description - MOVED HORIZONTALLY next to the heading instead of below it */}
          <div className="lg:w-1/2 lg:pt-14">
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Try our platform to analyze your trades, track your progress, and make informed decisions with ease. We will keep suggesting areas you can improve.
            </p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative p-6 rounded-lg border border-white/10 bg-[#1A1F2C]/60 backdrop-blur-md overflow-hidden group hover:border-primary/20 transition-all duration-300"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#1A1F2C]/80 flex items-center justify-center mb-5 border border-white/5 group-hover:border-primary/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-primary-light" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index}
              className="relative p-6 rounded-lg border border-white/10 bg-[#1A1F2C]/60 backdrop-blur-md overflow-hidden group hover:border-primary/20 transition-all duration-300 flex"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 rounded-xl bg-[#1A1F2C]/80 flex-shrink-0 flex items-center justify-center mr-5 border border-white/5 group-hover:border-primary/20 transition-colors duration-300 relative">
                <feature.icon className="w-7 h-7 text-primary-light" />
              </div>
              <div className="relative">
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
