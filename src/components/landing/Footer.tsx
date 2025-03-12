
import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Disclaimer */}
          <div className="space-y-4">
            <div className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Mental
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tools for trading psychology involves substantial risk & is not appropriate for everyone. Only risk capital should be used for trading. Testimonials appearing on this website may not be representative of other users and is not a guarantee of future performance or success.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-4">
            <ul className="space-y-2">
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
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Supported Brokers
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Become A Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-4">
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <div className="flex space-x-2">
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
              <Link 
                to="#" 
                className="w-10 h-10 rounded-md bg-[#12151E] flex items-center justify-center text-gray-300 hover:text-primary-light transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                to="#" 
                className="w-10 h-10 rounded-md bg-[#12151E] flex items-center justify-center text-gray-300 hover:text-primary-light transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-white/5 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Mental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
