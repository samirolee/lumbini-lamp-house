import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Moon } from 'lucide-react';

export const MoonPhase: React.FC = () => {
  // Approximate moon phase calculation
  // Cycle is ~29.53 days. Reference new moon: Jan 6, 2000
  const phaseInfo = useMemo(() => {
    const referenceDate = new Date(2000, 0, 6);
    const now = new Date();
    const diff = now.getTime() - referenceDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    const phaseValue = (days / 29.53) % 1; // 0 to 1
    
    let label = '';
    let iconScale = 1;
    
    if (phaseValue < 0.03 || phaseValue > 0.97) label = 'New Moon';
    else if (phaseValue < 0.22) label = 'Waxing Crescent';
    else if (phaseValue < 0.28) label = 'First Quarter';
    else if (phaseValue < 0.47) label = 'Waxing Gibbous';
    else if (phaseValue < 0.53) label = 'Full Moon';
    else if (phaseValue < 0.72) label = 'Waning Gibbous';
    else if (phaseValue < 0.78) label = 'Last Quarter';
    else label = 'Waning Crescent';

    return { phaseValue, label };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-2 group cursor-help"
      title={`Current Moon Phase: ${phaseInfo.label}`}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* The Base (Dark side) */}
        <div className="absolute inset-0 rounded-full border border-theme-border" />
        
        {/* The Light Side - Simplified Visual representation */}
        <motion.div 
          className="absolute inset-0 bg-saffron/20 rounded-full blur-[2px]"
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <Moon className="w-4 h-4 text-saffron opacity-60 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow according to phase */}
        {phaseInfo.label === 'Full Moon' && (
          <div className="absolute inset-0 bg-saffron/20 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-[8px] uppercase tracking-[0.2em] text-stone-600 group-hover:text-stone-400 transition-colors">
        {phaseInfo.label}
      </span>
    </motion.div>
  );
};
