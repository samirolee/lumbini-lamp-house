import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Sparkles, Loader2, Globe, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WHATSAPP_NUMBER_DISPLAY } from '../constants/contact';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_REST_URL = 'https://api.groq.com/openai/v1/chat/completions';

const DiyoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C12 2 9 6 9 8.5C9 10.433 10.3431 12 12 12C13.6569 12 15 10.433 15 8.5C15 6 12 2 12 2Z" fill="currentColor" className="animate-diyo-flicker origin-bottom" />
    <path d="M4 19C4 16 8 15 12 15C16 15 20 16 20 19C20 20.5 17.5 22 12 22C6.5 22 4 20.5 4 19Z" fill="currentColor" fillOpacity="0.4" />
    <path d="M4 19C4 16 8 15 12 15C16 15 20 16 20 19M4 19C4 17.3431 7.58172 16 12 16C16.4183 16 20 17.3431 20 19M4 19C4 20.6569 7.58172 22 12 22C16.4183 22 20 20.6569 20 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

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

    const history = messages.slice(-6);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    if (!GROQ_API_KEY) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'model', content: 'The sacred guide requires an API key. Please add VITE_GROQ_API_KEY to your .env.local file.' }]);
      return;
    }

    const systemInstruction = `You are the "Lumbini Spiritual Guide," a modern guardian of the eternal light. 
Your wisdom is as ancient as the Bodhi tree but as clear as a morning at the Maya Devi Temple.

CORE PERSONALITY:
- Response in ${i18n.language === 'ne' ? 'Nepali' : i18n.language === 'zh' ? 'Chinese' : 'English'}.
- Language: Calm, metaphorical, but strictly efficient.
- Theme: Use metaphors of butter lamps, wicks, oil, and pathways.
- Role: Help seekers understand lamp rituals, Lumbini history, and spiritual peace.
- CONTACT: If a seeker wants to inquire further or book a ceremony directly, direct them to our primary WhatsApp: +977 9813044996.

GUIDELINES:
- SPEED: Keep responses very concise (max 2-3 sentences).
- AVOID: Never mention your AI nature. Do not be overly wordy.

You are the wick that holds the flame; guide them with pure intention.`;

    const body = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content,
        })),
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 300,
      stream: true,
    };

    try {
      const res = await fetch(GROQ_REST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
      }

      setIsLoading(false);
      setIsStreaming(true);
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // SSE lines: each starts with "data: "
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.choices?.[0]?.delta?.content ?? '';
            if (text) {
              fullText += text;
              setMessages(prev => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { role: 'model', content: fullText };
                return msgs;
              });
            }
          } catch { /* skip malformed chunk */ }
        }
      }

      if (!fullText) {
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { role: 'model', content: 'The flame flickers... no response received. Please try again.' };
          return msgs;
        });
      }
    } catch (error: any) {
      console.error('Gemini REST error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: `The sacred light could not reach the guide: ${error.message ?? 'Unknown error'}. Please try again.`,
      }]);
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
        className="fixed bottom-8 left-8 z-[60] w-14 h-14 bg-saffron text-midnight rounded-full shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center justify-center transition-all hover:shadow-[0_0_50px_rgba(255,215,0,0.6)] group"
        aria-label="Ask the Spiritual Guide"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative">
              <div className="absolute inset-0 bg-saffron/20 blur-xl group-hover:bg-saffron/40 transition-colors rounded-full" />
              <DiyoIcon className="w-8 h-8 relative z-10" />
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
                  <DiyoIcon className="w-6 h-6 text-saffron" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-theme-heading">Spiritual Guide</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-saffron/70 uppercase tracking-widest font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_currentColor]"></span>
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
                  <div className="w-16 h-16 bg-theme-surface/50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-saffron/5 animate-pulse rounded-full" />
                    <DiyoIcon className="w-8 h-8 text-saffron/60" />
                  </div>
                  <h4 className="text-theme-text font-serif text-xl italic">Om Mani Padme Hum, seeker.</h4>
                  <p className="text-stone-500 text-sm font-light leading-relaxed max-w-[240px] mx-auto">
                    I am the presence within this House. How may I guide your soul through the light today?
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} chat-bubble-fade`}
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
                  <div className="bg-theme-surface/50 border border-theme-border p-4 rounded-2xl rounded-tl-none flex items-center gap-4">
                    <div className="relative w-3 h-3">
                      <div className="absolute inset-0 bg-saffron rounded-full animate-pulsing-light" />
                      <div className="absolute inset-0 bg-saffron/50 rounded-full animate-pulsing-light" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <span className="text-xs text-stone-500 font-light italic">The wax melts, the wisdom forms...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="px-6 py-2 bg-theme-bg/30 flex gap-2 overflow-x-auto no-scrollbar">
              {['Ashoka Pillar History', '108 Lamps Meaning', 'Full Moon Ceremony', 'Best number in Buddhism'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setInput(tag)}
                  className="whitespace-nowrap px-3 py-1 bg-theme-surface/30 border border-theme-border rounded-full text-[9px] uppercase tracking-widest text-theme-text/60 hover:text-saffron hover:border-saffron/30 transition-all"
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
