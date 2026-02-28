import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const [installed, setInstalled] = useState<string[]>([]);

  const extensions = [
    { id: 'm7_ext', name: 'M7 Extension', required: true },
    { id: 'helper_1', name: 'Extensão Helper 1', required: true },
    { id: 'helper_2', name: 'Extensão Helper 2', required: true },
  ];

  const handleInstall = async (id: string, name: string) => {
    const userId = user?.uid || 'guest';
    
    await fetch('/api/extensions/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        version: '1.0.0',
        category: 'Required',
        icon: `https://picsum.photos/seed/${id}/48`,
        userId: userId
      }),
    });

    setInstalled(prev => [...prev, id]);
  };

  const allInstalled = installed.length >= 3;

  return (
    <div className="min-h-screen bg-bg-main p-6 flex flex-col items-center justify-center dot-grid">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-card border border-primary rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <h1 className="text-2xl font-extrabold text-text-primary mb-2 text-center">Instale as extensões para começar</h1>
        <p className="text-text-muted text-sm mb-10 text-center">O M7 Browser precisa de 3 extensões para funcionar</p>

        <div className="space-y-4 mb-10">
          {extensions.map((ext) => (
            <div key={ext.id} className="flex items-center justify-between p-4 bg-bg-main rounded-2xl border border-border-subtle">
              <div>
                <h3 className="font-bold text-sm text-text-primary">{ext.name}</h3>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Obrigatória</span>
              </div>
              
              {installed.includes(ext.id) ? (
                <div className="flex items-center gap-1.5 text-primary">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold">Instalada</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleInstall(ext.id, ext.name)}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-extrabold hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <Upload size={14} />
                  Fazer Upload
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          disabled={!allInstalled}
          onClick={onComplete}
          className={`w-full py-4 rounded-2xl font-extrabold text-white flex items-center justify-center gap-2 transition-all ${
            allInstalled 
              ? 'cta-gradient pulse-cta shadow-lg' 
              : 'bg-bg-card-2 text-text-faint cursor-not-allowed'
          }`}
        >
          Continuar para o Navegador
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};
