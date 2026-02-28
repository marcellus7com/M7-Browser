import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Extension } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const BonusScreen: React.FC = () => {
  const { user } = useAuth();
  const [missingExtensions, setMissingExtensions] = useState<string[]>([]);
  const url = 'https://wagner.marcellus7.com/bonus';

  useEffect(() => {
    const checkRequiredExtensions = async () => {
      const userId = user?.uid || 'guest';
      try {
        const res = await fetch(`/api/users/${userId}/extensions`);
        if (!res.ok) throw new Error('Failed to fetch extensions');
        const data: Extension[] = await res.json();

        const activeExtensions = data
          .filter(ext => Number(ext.isActive) === 1)
          .map(ext => ext.name.toLowerCase().trim());

        const hasExt1 = activeExtensions.some(name =>
          name === 'extensionone' ||
          name.includes('extensionone') ||
          name === 'extension 1' ||
          name.includes('extension 1')
        );

        const hasExt2 = activeExtensions.some(name =>
          name === 'extensiontwo' ||
          name.includes('extensiontwo') ||
          name === 'extension 2' ||
          name.includes('extension 2')
        );

        const missing = [];
        if (!hasExt1) missing.push('ExtensionOne');
        if (!hasExt2) missing.push('ExtensionTwo');

        setMissingExtensions(prev => {
          if (prev.length === missing.length && prev.every((val, index) => val === missing[index])) {
            return prev;
          }
          return missing;
        });
      } catch (error) {
        console.debug('Extension check failed');
      }
    };

    checkRequiredExtensions();
    const interval = setInterval(checkRequiredExtensions, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    // Outer wrapper is scrollable so the user can scroll down to reach buttons
    // inside the iframe content area
    <div className="flex flex-col h-full bg-bg-main overflow-y-auto">
      {/* iframe wrapper: tall enough to contain the page + button area below the fold */}
      <div className="relative w-full" style={{ height: 'calc(100vh + 200px)' }}>
        <iframe
          src={url}
          // Fill the entire wrapper — the extra 200 px lets the user scroll
          // down to reveal and tap the button inside the iframe content.
          className="w-full border-none"
          style={{ height: '100%' }}
          title="M7 Bônus"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; publickey-credentials-get; geolocation; microphone; camera; clipboard-read"
          allowFullScreen
          scrolling="no"
        />

        {/* Warning Overlay if missing required extensions */}
        <AnimatePresence>
          {missingExtensions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none"
            >
              <div className="bg-danger/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
                <AlertCircle size={20} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider">Atenção: Extensões Faltando</p>
                  <p className="text-[10px] opacity-90">Instale {missingExtensions.join(' e ')} para o funcionamento correto.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};