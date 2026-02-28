import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const userId = user?.uid || 'guest';
    const res = await fetch(`/api/notifications/${userId}`);
    const data = await res.json();
    setNotifications(data);
  };

  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    fetchNotifications();
  };

  const deleteNotification = async (id: number) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = async () => {
    const userId = user?.uid || 'guest';
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    fetchNotifications();
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-bg-main">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary">Notificações</h1>
        <button 
          onClick={markAllAsRead}
          className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
        >
          Marcar todas como lidas
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => (
            <div key={notif.id} className="relative overflow-hidden rounded-2xl">
              {/* Delete Background Action */}
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end px-6 rounded-2xl">
                <Trash2 size={20} className="text-red-500" />
              </div>

              <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) {
                    deleteNotification(notif.id);
                  }
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`bg-bg-card border border-border-subtle rounded-2xl p-4 flex gap-4 relative cursor-pointer transition-all hover:bg-white/5 ${!notif.isRead ? 'border-primary/30' : ''}`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary/20 text-primary' : 'bg-bg-card-2 text-text-faint'}`}>
                  <Bell size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold text-sm truncate pr-2 ${!notif.isRead ? 'text-text-primary' : 'text-text-muted'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-text-faint whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.isRead ? 'text-text-muted' : 'text-text-faint'}`}>
                    {notif.body}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell size={64} className="text-text-faint mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-text-muted">Tudo limpo por aqui</h3>
            <p className="text-sm text-text-faint">Você não tem novas notificações.</p>
          </div>
        )}
      </div>
    </div>
  );
};
