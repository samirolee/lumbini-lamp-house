import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageSquare, Sparkles, Loader2, Globe, Flame } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { useTranslation } from 'react-i18next';
import { WHATSAPP_NUMBER_DISPLAY } from '../constants/contact';

// Lazy initialization helper for the Gemini API
let aiInstance: any = null;
const getAIClient = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const SpiritualGuide: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Maintain a concise history for maximum speed and relevance
    const history = messages.slice(-6); 
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getAIClient();
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-flash-latest",
        contents: [
          ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `You are the "Lumbini Spiritual Guide," a modern guardian of the eternal light. 
          Your wisdom is as ancient as the Bodhi tree but as clear as a morning at the Maya Devi Temple.
          
          CORE PERSONALITY:
          - Response in ${i18n.language === 'ne' ? 'Nepali' : i18n.language === 'zh' ? 'Chinese' : 'English'}.
          - Language: Calm, metaphorical, but strictly efficient.
          - Theme: Use metaphors of butter lamps, wicks, oil, and pathways.
          - Role: Help seekers understand lamp rituals, Lumbini history, and spiritual peace.
          - CONTACT: If a seeker wants to inquire further or book a ceremony directly, direct them to our primary WhatsApp: ${WHATSAPP_NUMBER_DISPLAY}.
          
          GUIDELINES:
          - SPEED: Keep responses very concise (max 2-3 sentences).
          - AVOID: Never mention your AI nature. Do not be overly wordy.
          
          You are the wick that holds the flame; guide them with pure intention.`,
          
          // Simplified config to resolve 500/Status 0 connectivity issues
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        },
      });

      setIsLoading(false);
      setIsStreaming(true);
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      let fullText = '';
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', content: fullText };
            return newMessages;
          });
        }
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      let errorMessage = "I am having trouble connecting to the sacred archives. Please check your connection or ensuring your API Key is set in Settings.";
      
      if (error.message === "GEMINI_API_KEY_MISSING") {
        errorMessage = "The sacred guide requires an API Key. Please provide one in the application Settings to begin our journey.";
      } else if (error.message?.includes("0")) {
        errorMessage = "The connection was interrupted. Please ensure you are not using a VPN or Firewall that blocks the Google AI services.";
      }
      
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 left-8 z-[60] w-14 h-14 bg-saffron text-midnight rounded-full shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center justify-center transition-all"
        aria-label="Open Spiritual Guide Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-8 z-[60] w-[90vw] md:w-[400px] h-[600px] glass-card shadow-2xl flex flex-col overflow-hidden border-saffron/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-theme-border bg-theme-bg/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-saffron/10 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-saffron" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-theme-heading">Spiritual Guide</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-saffron/70 uppercase tracking-widest font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button 
                    onClick={() => setMessages([])}
                    className="p-2 text-stone-500 hover:text-saffron transition-colors"
                    title="Clear Conversation"
                  >
                    <Loader2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-stone-500 hover:text-theme-heading transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-theme-border"
            >
               {messages.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-theme-surface/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-stone-700" />
                  </div>
                  <h4 className="text-theme-text font-serif text-xl italic">Pranam, seeker.</h4>
                  <p className="text-stone-500 text-sm font-light leading-relaxed max-w-[240px] mx-auto">
                    I am here to guide your soul through the sacred rituals of Lumbini. How may I assist your journey?
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-light leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-saffron text-midnight font-medium rounded-tr-none shadow-lg' 
                        : 'bg-theme-surface/50 border border-theme-border text-theme-text rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-theme-surface/50 border border-theme-border p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-stone-500 font-light italic">Refining the light...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="px-6 py-2 bg-theme-bg/30 flex gap-2 overflow-x-auto no-scrollbar">
              {['Why light a lamp?', 'Lumbini history', 'Packages'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setInput(tag)}
                  className="whitespace-nowrap px-3 py-1 bg-theme-surface/30 border border-theme-border rounded-full text-[9px] uppercase tracking-widest text-theme-text/60 hover:text-saffron transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-theme-bg/80 border-t border-theme-border">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the Guide..."
                  className="w-full bg-theme-surface/30 border border-theme-border rounded-full py-4 pl-6 pr-14 text-sm font-light text-theme-heading placeholder:text-stone-700 focus:border-saffron outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-saffron text-midnight rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
