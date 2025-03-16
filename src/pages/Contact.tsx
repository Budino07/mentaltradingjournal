
import React from "react";
import { Footer } from "@/components/landing/Footer";
import { Mail, Instagram, Twitter, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-x-hidden">
      {/* Background effects - similar to landing page for consistency */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#1A1F2C]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-0 -right-40 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/5 backdrop-blur-md border-b border-white/5">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Mental
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/"
                className="text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4 py-2 rounded transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <section className="relative pt-32 pb-20 min-h-[70vh] flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                We're here to{" "}
                <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                  support you
                </span>
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Have questions about our trading journal? We're just a message away. 
                Our team is ready to help you elevate your trading performance.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Left Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300 hover:bg-white/10 group">
                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/20 rounded-full opacity-70 group-hover:bg-primary/30 transition-all duration-300"></div>
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-accent/20 rounded-full opacity-70 group-hover:bg-accent/30 transition-all duration-300"></div>
                
                <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Get in Touch</h2>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-primary-light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Email Us</h3>
                      <a 
                        href="mailto:support@mentaltradingjournal.com" 
                        className="text-primary-light hover:underline"
                      >
                        support@mentaltradingjournal.com
                      </a>
                      <p className="text-sm text-gray-400 mt-1">
                        We'll respond within 24-48 hours
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-accent/20 p-3 rounded-lg mr-4">
                      <Clock className="h-6 w-6 text-accent-light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Business Hours</h3>
                      <p className="text-gray-300">9AM - 5PM GMT+7</p>
                      <p className="text-gray-400 text-sm">Monday - Friday</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300 hover:bg-white/10 group">
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-secondary/20 rounded-full opacity-70 group-hover:bg-secondary/30 transition-all duration-300"></div>
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/20 rounded-full opacity-70 group-hover:bg-primary/30 transition-all duration-300"></div>
                
                <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Connect With Us</h2>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start">
                    <div className="bg-secondary/20 p-3 rounded-lg mr-4">
                      <Instagram className="h-6 w-6 text-secondary-light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Instagram</h3>
                      <a 
                        href="https://instagram.com/mentaltradingjournal" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-secondary-light hover:underline"
                      >
                        @mentaltradingjournal
                      </a>
                      <p className="text-sm text-gray-400 mt-1">
                        Follow us for trading insights
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-3 rounded-lg mr-4">
                      <Twitter className="h-6 w-6 text-primary-light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Twitter</h3>
                      <a 
                        href="https://x.com/mentaltjournal" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-light hover:underline"
                      >
                        @mentaltjournal
                      </a>
                      <p className="text-sm text-gray-400 mt-1">
                        Stay updated with our latest news
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
