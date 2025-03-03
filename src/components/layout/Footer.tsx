
import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#0D0A1F] py-12 px-4 md:px-6">
      <div className="container max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Risk Disclaimer */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gradient">Mental</span>
          </Link>
          <p className="text-sm text-gray-400 max-w-md">
            Trading futures, currencies, and options carries significant risk and may not be suitable for all investors. It is essential to use only risk capital—funds you can afford to lose—when engaging in trading. Testimonials featured on this website reflect individual experiences and do not guarantee similar results for other clients or future success.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4 md:space-y-2 md:ml-auto">
          <h3 className="text-sm font-semibold text-gray-200">Navigation</h3>
          <nav className="flex flex-col space-y-2">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Legal & Social */}
        <div className="space-y-6">
          <div className="space-y-4 md:space-y-2">
            <h3 className="text-sm font-semibold text-gray-200">Legal</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </nav>
          </div>
          
          {/* Social Media Links */}
          <div className="flex space-x-3">
            <a href="https://twitter.com/mentaltradingjournal" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 flex items-center justify-center rounded bg-[#16152A] text-gray-400 hover:text-white transition-colors">
              <Twitter size={18} />
            </a>
            <a href="https://instagram.com/mentaltradingjournal" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 flex items-center justify-center rounded bg-[#16152A] text-gray-400 hover:text-white transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://linkedin.com/company/mentaltradingjournal" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 flex items-center justify-center rounded bg-[#16152A] text-gray-400 hover:text-white transition-colors">
              <Linkedin size={18} />
            </a>
            <a href="https://facebook.com/mentaltradingjournal" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 flex items-center justify-center rounded bg-[#16152A] text-gray-400 hover:text-white transition-colors">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
