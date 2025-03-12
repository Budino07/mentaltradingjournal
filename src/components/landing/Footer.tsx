
import React from "react";
import { Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] py-8 sm:py-12 md:py-16 border-t border-white/5">
      <div className="container mx-auto px-3 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {/* Logo and Disclaimer */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Mental
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Trading futures, currencies, and options involves significant risk and may not be suitable for all investors. Only risk capital—money you can afford to lose—should be used for trading. Testimonials featured on this website reflect individual experiences and may not represent typical results. Past performance is not indicative of future success.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center mt-4 md:mt-0">
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Pricing
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/pBXQnErHYg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center md:items-end mt-4 md:mt-0">
            <div className="flex space-x-3">
              <Link 
                to="#" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#12151E] flex items-center justify-center text-gray-300 hover:text-primary-light transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link 
                to="#" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#12151E] flex items-center justify-center text-gray-300 hover:text-primary-light transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 border-t border-white/5 text-center text-xs sm:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Mental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
