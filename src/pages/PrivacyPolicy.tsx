
import React from "react";
import { Footer } from "@/components/landing/Footer";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-x-hidden">
      {/* Background effects - similar to other pages for consistency */}
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

        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl">
              <div className="flex items-center mb-6 space-x-3">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-primary-light" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
              </div>
              
              <div className="text-sm md:text-base text-gray-200 space-y-6">
                <p className="text-gray-400">Effective Date: March 15th 2025</p>
                
                <p>
                  Mental Trading Journal ("I", "me", or "my") is committed to protecting your privacy. 
                  This Privacy Policy outlines how I collect, use, and safeguard your personal 
                  information when you visit or use www.mentaltradingjournal.com (the "Website" or "Service"). 
                  By accessing or using the Service, you acknowledge and agree to the terms outlined below.
                </p>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">1. Information Collection</h2>
                  <p className="mb-2">I may collect and process the following types of information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-medium text-white">Personal Information:</span> Name, email address, and other details you provide when registering for an account, subscribing to communications, or contacting me.</li>
                    <li><span className="font-medium text-white">Trading Data:</span> Trade details, notes, and other inputs you voluntarily submit while using the journal features.</li>
                    <li><span className="font-medium text-white">Technical Data:</span> IP address, browser type, device information, and usage statistics collected through analytics tools to enhance the Website's functionality and user experience.</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">2. How Your Information Is Used</h2>
                  <p className="mb-2">Your data is used to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and improve the Service.</li>
                    <li>Personalize user experience and optimize platform functionality.</li>
                    <li>Communicate updates, promotions, or important policy changes (you may opt out at any time).</li>
                    <li>Analyze trends and enhance security measures.</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">3. Data Sharing and Security</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-medium text-white">No Sale of Data:</span> I do not sell, rent, or distribute your personal information to third parties.</li>
                    <li><span className="font-medium text-white">Limited Sharing:</span> Data may be shared only as required by law, or with trusted service providers assisting in website operations (e.g., analytics tools, hosting services), under strict confidentiality agreements.</li>
                    <li><span className="font-medium text-white">Security Measures:</span> I implement industry-standard security practices, including encryption, to protect your data from unauthorized access, loss, or misuse.</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">4. Your Rights and Choices</h2>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Request access to, correction, or deletion of your personal data.</li>
                    <li>Opt out of marketing communications at any time.</li>
                    <li>Manage cookie preferences through your browser settings.</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">5. Updates to This Privacy Policy</h2>
                  <p>I may update this Privacy Policy periodically. Any significant changes will be posted on this page, and, where appropriate, notified via email.</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">6. Contact Information</h2>
                  <p>For questions, concerns, or data-related requests, please contact me at:</p>
                  <p className="mt-2">Email: <a href="mailto:contact@mentaltradingjournal.com" className="text-primary-light hover:underline">contact@mentaltradingjournal.com</a></p>
                </div>
                
                <p className="italic">By using this Website, you consent to the terms of this Privacy Policy.</p>
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

export default PrivacyPolicy;
