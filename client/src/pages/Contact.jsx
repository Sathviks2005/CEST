import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact Support & Feedback
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Have questions regarding CEST, clinical features, or technical support? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Get In Touch</h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center text-lg shrink-0">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Email Address</p>
                  <p>support@cest-health.org</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-tealBrand-50 dark:bg-slate-800 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center text-lg shrink-0">
                  <FaPhone />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Support Hotline</p>
                  <p>+1 (800) 273-CEST (2378)</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Clinical Research Center</p>
                  <p>100 Health Sciences Plaza, Suite 400</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2 text-xs sm:text-sm">
            <h3 className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
              Emergency & Crisis Helpline
            </h3>
            <p>
              If you or someone you know is experiencing a mental health crisis, immediate thoughts of self-harm, or severe medical emergency, please call <strong>988</strong> immediately or seek emergency medical care.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <FaCheckCircle className="text-5xl text-tealBrand-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Thank you for contacting CEST support. Our clinical and technical support team will respond within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send Us a Message</h2>

              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Jane Doe or Alex Smith"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.org"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Clinical Inquiry / General Question"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can CEST assist you?"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <FaPaperPlane />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
