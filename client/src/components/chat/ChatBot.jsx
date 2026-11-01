import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBrain,
  FaTimes,
  FaPaperPlane,
  FaTrashAlt,
  FaExclamationTriangle,
  FaUserMd,
  FaRedo,
  FaShieldAlt,
  FaComments,
} from 'react-icons/fa';
import { chatService } from '../../services/chatService';
import { assessmentService } from '../../services/assessmentService';
import { CRISIS_RESOURCES } from '../../config/crisisResources';
import { ClinicianContactCard } from '../exercise/interactive/ClinicianContactCard';
import { useMotionSafe } from '../exercise/interactive/motionPresets';

const QUICK_START_CHIPS = [
  'What does my score mean?',
  'Suggest an exercise for today',
  'I feel overwhelmed',
  'How do I talk to a clinician?',
];

const INITIAL_GREETING = {
  id: 'greeting',
  role: 'assistant',
  content:
    'Hello! I am your CEST Wellbeing Assistant. I can help explain screening score bands (PHQ-9, GAD-7, ISI, PCL-5, Y-BOCS), guide you to relevant in-app CBT exercises, and share general coping strategies.\n\nAsk me about CEST, your questionnaire results, the exercises, or how you\'re feeling.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const ChatBot = ({ context = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [showClinicianModal, setShowClinicianModal] = useState(false);
  const [detectedContext, setDetectedContext] = useState(context);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { isReduced, safeTransition } = useMotionSafe();

  // Load user's latest assessment context if not provided via props
  useEffect(() => {
    if (context) {
      setDetectedContext(context);
      return;
    }

    let isMounted = true;
    const fetchLatestAssessment = async () => {
      try {
        const res = await assessmentService.getMyAssessments();
        const list = res?.data || [];
        if (list.length > 0 && isMounted) {
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const latest = list[0];
          const rawInst = latest.disorderSlug || latest.assessmentType || 'PHQ-9';
          const rawSev = latest.severity || 'Mild';
          setDetectedContext({
            instrument: String(rawInst).toLowerCase(),
            severity: String(rawSev).toLowerCase(),
          });
        }
      } catch {
        // Fallback silently if offline or none recorded
      }
    };

    fetchLatestAssessment();
    return () => {
      isMounted = false;
    };
  }, [context]);

  // Focus input and scroll to bottom when panel opens
  useEffect(() => {
    if (isOpen && hasConsented) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, hasConsented]);

  // Scroll to bottom on messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, chatError]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showClinicianModal) {
          setShowClinicianModal(false);
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showClinicianModal]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isLoading) return;

    setChatError(null);
    setInputText('');

    const userMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Send conversation history formatted for backend validation
      const payloadMessages = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatService.sendMessage({
        messages: payloadMessages,
        context: detectedContext,
      });

      if (res && res.success) {
        const assistantMessage = {
          id: 'asst_' + Date.now(),
          role: 'assistant',
          content: res.reply || 'I am here to support you.',
          crisis: Boolean(res.crisis),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setChatError({
          message: res?.message || 'Chat service is temporarily unavailable.',
          canRetry: true,
          failedText: text,
        });
      }
    } catch (err) {
      const status = err.response?.status;
      let errorMsg = 'Unable to reach the wellbeing assistant. Please check your connection and try again.';

      if (status === 429) {
        errorMsg = 'You have sent several messages in a short time. Please wait a minute before sending another.';
      } else if (status === 503) {
        errorMsg = 'The assistant service is currently undergoing setup or is not configured.';
      } else if (status === 502 || status === 504) {
        errorMsg = 'The assistant timed out or is temporarily busy. Please try again.';
      }

      setChatError({
        message: errorMsg,
        canRetry: true,
        failedText: text,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
    setChatError(null);
  };

  const handleRetry = () => {
    if (chatError?.failedText) {
      const retryText = chatError.failedText;
      // Remove last failed message if needed or send again
      handleSendMessage(retryText);
    }
  };

  return (
    <>
      {/* Floating Activation Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Wellbeing Assistant' : 'Open Wellbeing Assistant'}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-tealBrand-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-400/40 transition-shadow"
          whileHover={isReduced ? {} : { scale: 1.06 }}
          whileTap={isReduced ? {} : { scale: 0.94 }}
        >
          {isOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <>
              <FaComments className="text-2xl" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tealBrand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-tealBrand-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chat Dialog Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            animate={isReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            transition={safeTransition({ duration: 0.24, ease: 'easeOut' })}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-[95vw] h-[540px] max-h-[82vh] glass-panel rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-brand-600 via-brand-700 to-tealBrand-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white text-sm shadow-inner">
                  <FaBrain />
                </div>
                <div>
                  <h2 id="chatbot-title" className="text-sm font-bold leading-tight">
                    Wellbeing Assistant
                  </h2>
                  <p className="text-[10px] text-tealBrand-200">CEST Guidance & CBT Companion</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  aria-label="Clear chat history"
                  title="Clear chat"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors text-xs"
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close assistant"
                  title="Close"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors text-sm"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Persistent Medical Disclaimer Notice */}
            <div className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/70 dark:border-slate-800/70 text-[10.5px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <FaShieldAlt className="text-brand-500 shrink-0 text-[11px]" />
              <span className="truncate">
                Not medical advice. In an emergency, contact your local emergency number.
              </span>
            </div>

            {/* In-Panel Consent Check (One-time per session) */}
            {!hasConsented ? (
              <div className="flex-1 p-5 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl">
                  <FaShieldAlt />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Privacy & AI Notice
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-1">
                    Your messages are sent to an AI service (Groq) to generate educational replies.
                    Please do not share names, personal contact details, or traumatic event details.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 pt-2 w-full max-w-xs">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setHasConsented(true)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-md"
                  >
                    I Agree
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Viewport */}
                <div
                  className="flex-1 p-3.5 space-y-3.5 overflow-y-auto"
                  aria-live="polite"
                  tabIndex={0}
                  aria-label="Conversation message history"
                >
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm break-words whitespace-pre-wrap leading-relaxed ${
                            isUser
                              ? 'bg-brand-600 text-white rounded-br-none'
                              : msg.crisis
                              ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-100 rounded-bl-none shadow-md'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                          }`}
                        >
                          {/* Message content strictly rendered as plain text */}
                          {msg.content}

                          {/* Extra interactive card for crisis response */}
                          {msg.crisis && (
                            <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/60 space-y-2.5">
                              <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                <FaExclamationTriangle className="text-amber-600 dark:text-amber-400" />
                                Immediate Help Available 24/7
                              </p>
                              <button
                                onClick={() => setShowClinicianModal(true)}
                                className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                              >
                                <FaUserMd /> Contact My Clinician / Clinic
                              </button>
                            </div>
                          )}
                        </div>

                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs shadow-sm flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="text-[11px]">Assistant is typing</span>
                        <span className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Notification Bubble with Retry */}
                  {chatError && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs space-y-2">
                      <p className="leading-snug">{chatError.message}</p>
                      {chatError.canRetry && (
                        <button
                          onClick={handleRetry}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline"
                        >
                          <FaRedo className="text-[10px]" /> Retry sending message
                        </button>
                      )}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick-Start Prompts (shown when only greeting or minimal chat) */}
                {messages.length <= 2 && !isLoading && (
                  <div className="px-3 pb-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30">
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
                      Suggested questions:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_START_CHIPS.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shadow-2xs text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input & Action Bar */}
                <div className="p-3 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex flex-col gap-1.5"
                  >
                    <div className="relative flex items-center">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={inputText}
                        maxLength={500}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask me about CEST, your questionnaire results, the exercises, or how you're feeling..."
                        className="w-full resize-none text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent focus:border-transparent transition-all placeholder:text-slate-400"
                        aria-label="Type your message to Wellbeing Assistant"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !inputText.trim()}
                        aria-label="Send message"
                        className="absolute right-2 p-2 rounded-lg bg-brand-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-500 transition-all text-xs focus:outline-none"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                      <span>Enter to send • Shift+Enter for new line</span>
                      <span>{inputText.length}/500</span>
                    </div>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clinician Contact Modal */}
      <AnimatePresence>
        {showClinicianModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={isReduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-tealBrand-500/40 relative"
            >
              <button
                onClick={() => setShowClinicianModal(false)}
                aria-label="Close clinician modal"
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <FaTimes />
              </button>
              <ClinicianContactCard
                instrumentName="Wellbeing Assessment"
                severityLabel="Clinical Care Recommended"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
