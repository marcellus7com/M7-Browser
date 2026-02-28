import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            {/* Logo Placeholder - User should replace this with their actual logo */}
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/m7logo/200" 
                alt="M7 Logo" 
                className="w-32 h-32 object-contain"
              />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl font-black text-white tracking-tighter mb-1">M7 BROWSER</h1>
            <div className="flex items-center gap-1 justify-center">
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
