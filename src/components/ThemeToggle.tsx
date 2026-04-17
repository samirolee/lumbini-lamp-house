import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ThemeToggle: React.FC = () => {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  // Sync with initial load or other tabs
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLight(true);
    }
  }, []);

  return (
    <button
      onClick={() => setIsLight(!isLight)}
      className="relative w-14 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center cursor-pointer transition-colors duration-500 hover:border-saffron/50 group"
      aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-saffron flex items-center justify-center shadow-lg"
        animate={{
          x: isLight ? 28 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {isLight ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3 h-3 text-midnight" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3 h-3 text-midnight" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest text-saffron pointer-events-none whitespace-nowrap">
        {isLight ? "Sacred Daylight" : "Sacred Midnight"}
      </span>
    </button>
  );
};
