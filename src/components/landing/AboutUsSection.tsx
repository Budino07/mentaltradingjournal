
import React from "react";

export const AboutUsSection = () => {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0">
        {/* Using the same background styles as the hero section for consistency */}
        <div className="absolute inset-0 bg-[#1A1F2C]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0">
          <div className="absolute bottom-0 -left-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-60 h-60 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 mb-5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/70">
            About Us
          </div>
          
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">
            Our Mission
          </h2>
          
          {/* Content Card */}
          <div className="relative p-8 md:p-10 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-sm opacity-50"></div>
            <div className="relative space-y-6 text-base md:text-lg text-gray-300 leading-relaxed">
              <p>
                At Mental, we're driven by our passion for both trading and personal growth. We know that trading is not just about data—it's about understanding your mind and behavior. Our platform blends advanced analytics with deep psychological insights to give traders a complete view of their performance.
              </p>
              <p>
                We're here to help you identify hidden patterns, uncover your strengths, and transform your mindset for long-term success. Whether you're just starting out or are a seasoned pro, our goal is to support your journey to greater awareness, discipline, and consistent profitability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
