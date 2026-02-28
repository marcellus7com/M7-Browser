import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogOut, Moon, Sun, Info, User, ChevronRight, MessageCircle, Puzzle, LogIn, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsScreen: React.FC<{ onNavigate?: (tab: any) => void; unreadCount?: number }> = ({ onNavigate, unreadCount }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 h-full overflow-y-auto bg-bg-main">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary">Ajustes</h1>
        <button 
          onClick={() => onNavigate?.('notifications')}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-subtle rounded-xl hover:bg-white/5 transition-all relative"
        >
          <Bell size={18} className="text-primary" />
          <span className="text-xs font-bold text-text-primary">Alertas</span>
          {unreadCount && unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-bg-main">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Account Section */}
      <section className="mb-10">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Conta</h2>
        {user ? (
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 flex items-center gap-4 mb-4">
            <img src={user.photoURL} alt={user.displayName} className="w-14 h-14 rounded-full border-2 border-primary p-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-text-primary">{user.displayName}</h3>
              <p className="text-xs text-text-muted">{user.email}</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate?.('chat')}
            className="w-full bg-bg-card border border-border-subtle rounded-2xl p-4 flex items-center gap-4 mb-4 hover:bg-white/5 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-bg-card-2 flex items-center justify-center text-text-faint">
              <User size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-text-primary">Fazer Login</h3>
              <p className="text-xs text-text-muted">Acesse para usar o suporte</p>
            </div>
          </button>
        )}
        {user && (
          <button 
            onClick={logout}
            className="w-full py-3 rounded-full border border-danger text-danger font-bold text-sm flex items-center justify-center gap-2 hover:bg-danger/5 transition-colors"
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        )}
      </section>

      {/* Appearance Section */}
      <section className="mb-10">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Aparência</h2>
        <div className="grid grid-cols-2 gap-4">
          <ThemeCard 
            active={theme === 'dark'} 
            onClick={() => theme !== 'dark' && toggleTheme()} 
            icon={<Moon size={20} />} 
            label="Escuro" 
          />
          <ThemeCard 
            active={theme === 'light'} 
            onClick={() => theme !== 'light' && toggleTheme()} 
            icon={<Sun size={20} />} 
            label="Claro" 
          />
        </div>
      </section>

      {/* Community Section */}
      <section className="mb-10">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Comunidade M7</h2>
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
          <ExternalLinkItem 
            href="https://whatsapp.com/channel/0029VafiqBe4tRrsSkBTYy35" 
            label="WhatsApp M7" 
            icon={<MessageCircle size={18} className="text-[#25D366]" />} 
          />
          <ExternalLinkItem 
            href="https://marcellus7.com/#plano" 
            label="Planos e Preços" 
            icon={<Info size={18} className="text-primary" />} 
          />
          <div 
            onClick={() => onNavigate?.('extensions')}
            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer border-b border-border-subtle"
          >
            <div className="flex items-center gap-3">
              <Puzzle size={18} className="text-primary" />
              <span className="text-sm font-medium">Gerenciar Extensões</span>
            </div>
            <ChevronRight size={16} className="text-text-faint" />
          </div>
          <div 
            onClick={() => onNavigate?.('chat')}
            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-primary" />
              <span className="text-sm font-medium">Suporte Técnico</span>
            </div>
            <ChevronRight size={16} className="text-text-faint" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Sobre</h2>
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
          <AboutItem label="Versão do app" value="1.9.9" />
          <AboutItem label="M7 Community" value="© 2026" />
        </div>
      </section>
    </div>
  );
};

const ExternalLinkItem: React.FC<{ href: string; label: string; icon: React.ReactNode }> = ({ href, label, icon }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-border-subtle"
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className="text-text-faint" />
  </a>
);

const ThemeCard: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
      active 
        ? 'bg-bg-card-2 border-primary text-primary' 
        : 'bg-bg-card border-border-subtle text-text-muted hover:border-text-faint'
    }`}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
    {active && <div className="text-[9px] font-bold uppercase opacity-60">Selecionado</div>}
  </button>
);

const AboutItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-4 flex items-center justify-between border-b border-border-subtle last:border-0">
    <span className="text-sm text-text-muted">{label}</span>
    <span className="text-sm font-bold text-text-primary">{value}</span>
  </div>
);
