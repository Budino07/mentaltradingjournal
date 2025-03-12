
import React from "react";
import { Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] py-12 sm:py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo and Disclaimer */}
          <div className="space-y-4 sm:space-y-6">
            <div className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Mental
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trading futures, currencies, and options involves significant risk and may not be suitable for all investors. Only risk capital—money you can afford to lose—should be used for trading. Testimonials featured on this website reflect individual experiences and may not represent typical results. Past performance is not indicative of future success.
            </p>
          </div>

          {/* All Links in a Single Column */}
          <div className="flex justify-center">
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/pBXQnErHYg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-3">
              <Link 
                to="#" 
                className="w-10 h-10 rounded-md bg-[#12151E] flex items-center justify-center text-gray-300 hover:text-primary-light transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                to="#" 
                className="w-10 h-10 rounded-md bg-[#12151E] flex items-center justify-center text-gray-300 hover:text-primary-light transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-white/5 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Mental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
