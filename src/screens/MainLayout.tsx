import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Gift, Bell, Settings, MessageCircle, Puzzle } from 'lucide-react';
import { BrowserScreen } from './browser/BrowserScreen';
import { ExtensionsScreen } from './extensions/ExtensionsScreen';
import { ChatScreen } from './chat/ChatScreen';
import { NotificationsScreen } from './notifications/NotificationsScreen';
import { SettingsScreen } from './settings/SettingsScreen';
import { OnboardingScreen } from './onboarding/OnboardingScreen';
import { LoginScreen } from './login/LoginScreen';
import { CursosScreen } from './cursos/CursosScreen';
import { BonusScreen } from './bonus/BonusScreen';

import { SplashScreen } from '../components/SplashScreen';

type Tab = 'painel' | 'cursos' | 'bonus' | 'notifications' | 'settings' | 'extensions' | 'chat';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('painel');
  const [visitedTabs, setVisitedTabs] = useState<Set<Tab>>(new Set(['painel']));
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setVisitedTabs(prev => new Set(prev).add(activeTab));
  }, [activeTab]);

  useEffect(() => {
    const checkNotifications = async () => {
      const userId = user?.uid || 'guest';
      try {
        // 1. Check extensions
        const extRes = await fetch(`/api/users/${userId}/extensions`);
        if (extRes.ok) {
          const extensions = await extRes.json();
          const activeExtensions = extensions
            .filter((ext: any) => Number(ext.isActive) === 1)
            .map((ext: any) => ext.name.toLowerCase().trim());
          
          const hasExt1 = activeExtensions.some((name: string) => 
            name === 'extensionone' || name.includes('extensionone') || name === 'extension 1' || name.includes('extension 1')
          );
          const hasExt2 = activeExtensions.some((name: string) => 
            name === 'extensiontwo' || name.includes('extensiontwo') || name === 'extension 2' || name.includes('extension 2')
          );

          if (!hasExt1 || !hasExt2) {
            const missing = [];
            if (!hasExt1) missing.push('ExtensionOne');
            if (!hasExt2) missing.push('ExtensionTwo');
            
            const title = 'ATENÇÃO: EXTENSÕES FALTANDO';
            const body = `Instale ${missing.join(' e ')} para o funcionamento correto.`;

            // Check if this notification already exists
            const notifRes = await fetch(`/api/notifications/${userId}`);
            const existingNotifs = await notifRes.json();
            const alreadyNotified = existingNotifs.some((n: any) => n.title === title && !n.isRead);

            if (!alreadyNotified) {
              await fetch('/api/admin/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, title, body })
              });
            }
          }
        }

        // 2. Fetch unread count
        const notifRes = await fetch(`/api/notifications/${userId}`);
        if (notifRes.ok) {
          const notifications = await notifRes.json();
          const unread = notifications.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error in background checks:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-bg-main text-text-primary overflow-hidden">
      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Keep Iframe screens alive and lazy load them */}
        <div className={`h-full ${activeTab === 'painel' ? 'block' : 'hidden'}`}>
          {visitedTabs.has('painel') && <BrowserScreen />}
        </div>
        <div className={`h-full ${activeTab === 'cursos' ? 'block' : 'hidden'}`}>
          {visitedTabs.has('cursos') && <CursosScreen />}
        </div>
        <div className={`h-full ${activeTab === 'bonus' ? 'block' : 'hidden'}`}>
          {visitedTabs.has('bonus') && <BonusScreen />}
        </div>
        
        {activeTab === 'extensions' && <ExtensionsScreen />}
        {activeTab === 'chat' && (user ? <ChatScreen /> : <LoginScreen />)}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'settings' && <SettingsScreen onNavigate={(tab) => setActiveTab(tab)} unreadCount={unreadCount} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 glass-nav flex items-center justify-around px-2 z-[100] relative">
        <NavButton 
          active={activeTab === 'cursos'} 
          onClick={() => setActiveTab('cursos')} 
          icon={<BookOpen size={22} />} 
          label="Cursos" 
        />
        <NavButton 
          active={activeTab === 'bonus'} 
          onClick={() => setActiveTab('bonus')} 
          icon={<Gift size={22} />} 
          label="Bônus" 
        />
        
        {/* Highlighted Center Item */}
        <div className="relative -top-6">
          <button 
            onClick={() => setActiveTab('painel')}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              activeTab === 'painel' 
                ? 'cta-gradient text-white scale-110 pulse-cta' 
                : 'bg-bg-card-2 text-text-faint border border-border-subtle'
            }`}
          >
            <LayoutDashboard size={28} />
          </button>
          <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'painel' ? 'text-primary' : 'text-text-faint'}`}>
            Painel
          </span>
        </div>

        <NavButton 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
          icon={<MessageCircle size={22} />} 
          label="Suporte" 
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<Settings size={22} />} 
          label="Ajustes" 
          hasDot={unreadCount > 0}
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number; hasDot?: boolean }> = ({ active, onClick, icon, label, badge, hasDot }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${active ? 'text-primary' : 'text-text-faint'}`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-bg-main">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {hasDot && badge === undefined && (
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-main" />
      )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);
