import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaHeart, FaPhone, FaEnvelope, FaLock, FaFileContract, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-tealBrand-400 flex items-center justify-center text-white shadow-lg">
                <FaBrain className="text-xl" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CEST
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering mental wellness through standardized evidence-aligned assessments, personalized cognitive enhancement modules, and continuous clinical progress tracking.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-brand-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">About CEST</Link></li>
              <li><Link to="/conditions" className="hover:text-brand-400 transition-colors">Mental Health Conditions</Link></li>
              <li><Link to="/cognitive-enhancement" className="hover:text-brand-400 transition-colors">Cognitive Enhancement</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Self User Registration</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Clinician Portal</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Secure Sign In</Link></li>
              <li><Link to="/forgot-password" className="hover:text-brand-400 transition-colors">Reset Password</Link></li>
              <li><Link to="/verify-email" className="hover:text-brand-400 transition-colors">Email Verification</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-brand-400" />
                <span>support@cest-health.org</span>
              </p>
              <p className="flex items-center gap-2">
                <FaPhone className="text-tealBrand-400" />
                <span>+1 (800) 273-CEST</span>
              </p>
              <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                24/7 Crisis Support: If you are in immediate danger or severe crisis, please call 988 or visit the nearest emergency center.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Disclaimer */}
        <div className="pt-8 space-y-4 text-xs text-slate-400 text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="space-y-2 max-w-3xl">
            <p>
              <strong className="text-slate-200">Legal Disclaimer:</strong> The Cognitive Enhancement Support Tool (CEST) provides educational materials and standardized self-support tools. It does not constitute medical advice, diagnosis, or clinical treatment plans. Always consult a qualified medical professional.
            </p>
            <p>© {new Date().getFullYear()} Cognitive Enhancement Support Tool (CEST). All rights reserved.</p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-6 pt-4 md:pt-0">
            <Link to="/contact" className="hover:text-white flex items-center gap-1">
              <FaLock className="text-slate-500" /> Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-white flex items-center gap-1">
              <FaFileContract className="text-slate-500" /> Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
