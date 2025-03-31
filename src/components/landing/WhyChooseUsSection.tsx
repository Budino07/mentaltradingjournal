
import React from "react";
import { Users, DollarSign, BarChart3, Zap, MessageSquare } from "lucide-react";

export const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Users,
      title: "Community-Driven Innovation",
      description: "We're in this together. Our founders listen, adapt, and build alongside you—because this journal is yours as much as ours."
    },
    {
      icon: DollarSign,
      title: "No Overpriced Extras",
      description: "We focus on features that help you build an edge. Get the best value in the market: $9/month or $90/year —simple, transparent pricing."
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
      title: "Personalized Actionable Insights",
      description: "Unlock real-time insights from our analytics that evolve as you trade, helping you make smarter decisions."
    },
    {
      icon: MessageSquare,
      title: "Accountability Made Easy",
      description: "Our pre-session and post-session check-ins, you'll take control of your trading journey, stay accountable, and constantly improve—every step of the way."
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
              Empower your trading with a platform designed to help you analyze, track, and improve your performance. Our actionable insights guide you towards smarter decisions, making your growth our priority.
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

        {/* Additional Features - Fixed alignment issue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index}
              className="relative p-6 rounded-lg border border-white/10 bg-[#1A1F2C]/60 backdrop-blur-md overflow-hidden group hover:border-primary/20 transition-all duration-300"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-start">
                <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-[#1A1F2C]/80 flex items-center justify-center mr-5 border border-white/5 group-hover:border-primary/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-primary-light" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
