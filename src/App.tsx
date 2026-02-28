import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginScreen } from './screens/login/LoginScreen';
import { MainLayout } from './screens/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg-main flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 80L50 20L80 80" stroke="#05989F" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="85" cy="85" r="8" fill="#FF0000" />
          </svg>
        </div>
        <div className="w-48 h-1 bg-bg-card rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-primary animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <MainLayout />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
