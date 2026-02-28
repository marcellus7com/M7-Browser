import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    // Simulate Google Login
    const mockUser = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      email: 'user@m7community.com',
      displayName: 'M7 Member',
      photoURL: 'https://picsum.photos/seed/m7/200',
      lastLogin: new Date().toISOString(),
    };
    login(mockUser);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Logo M7 */}
        <div className="mb-12 relative">
          <img 
            src="https://picsum.photos/seed/m7logo/200" 
            alt="M7 Logo" 
            className="w-40 h-40 object-contain"
          />
        </div>

        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">M7 Browser</h1>
        <p className="text-text-faint mb-12 font-medium">Faça login para continuar</p>

        <div className="w-full h-[1px] bg-white/10 mb-12" />

        <button
          onClick={handleGoogleLogin}
          className="w-full h-[56px] bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black shadow-2xl hover:bg-gray-100 transition-all active:scale-95 uppercase text-sm tracking-tight"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continuar com o Google
        </button>

        <p className="mt-12 text-[10px] text-text-faint leading-relaxed uppercase tracking-widest font-bold">
          Ao continuar, você concorda com os <span className="underline cursor-pointer">Termos de Uso</span> da M7 Community
        </p>
      </motion.div>
    </div>
  );
};
