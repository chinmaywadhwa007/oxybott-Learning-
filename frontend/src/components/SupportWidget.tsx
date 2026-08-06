import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, HelpCircle, AlertTriangle, Lightbulb, Send } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

type CategoryType = 'question' | 'broken' | 'idea';

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('question');
  const [message, setMessage] = useState('');
  const { setProfileModalOpen } = useAppStore();

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const categories: Array<{ id: CategoryType; label: string; icon: React.ReactNode }> = [
    { id: 'question', label: 'Question', icon: <HelpCircle className="w-4 h-4 text-sky-500 shrink-0" /> },
    { id: 'broken', label: 'Something is broken', icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> },
    { id: 'idea', label: 'I have an idea', icon: <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0" /> },
  ];

  return (
    <>
      {/* Floating Circular Support Bubble */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', mass: 0.5, stiffness: 160, damping: 18 }}
        className="fixed bottom-6 right-6 z-50 select-none"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#0B1727] text-white border border-[#5BE4FF]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-center cursor-pointer group hover:border-[#5BE4FF] transition-colors"
          aria-label="Open support chat"
        >
          <MessageSquare className="w-6 h-6 text-[#5BE4FF] group-hover:scale-110 transition-transform stroke-[2.2]" />
        </motion.button>
      </motion.div>

      {/* Support Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#091320]/80 backdrop-blur-sm"
            />

            {/* Modal Window Container (380px width, rounded 24px, white card) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', mass: 0.5, stiffness: 160, damping: 20 }}
              className="relative w-full max-w-[380px] rounded-[24px] bg-white p-6 sm:p-7 text-slate-900 shadow-2xl z-10 space-y-4 border border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Talk to us</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Questions, problems, ideas — all welcome!
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Category Buttons List */}
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full p-3 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-all duration-150 cursor-pointer select-none text-left ${
                        isActive
                          ? 'bg-[#F0F9FF] border-2 border-blue-600 text-blue-900 shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Textarea Field */}
              <div>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's up..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign in to send your message</span>
                  <Send className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-2xl bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Cancel or manage subscription
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
