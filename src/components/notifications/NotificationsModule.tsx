/**
 * CORE CAPITAL V3 — MODULE 10 : NOTIFICATIONS
 * Centre complet de notifications pour échéances, salaires, alertes boursières et messages.
 */

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Bell,
  CheckCircle2,
  Calendar,
  TrendingUp,
  MessageSquare,
  Clock,
  Trash2,
} from 'lucide-react';

export const NotificationsModule: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
  } = useFinance();

  const getIcon = (type: string) => {
    switch (type) {
      case 'due_date':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      case 'income_expected':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'market_alert':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case 'message_received':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>MODULE 10 — RAPPELS & NOTIFICATIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Centre de Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Échéances financières imminentes, rentrées attendues et alertes boursières.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer self-start sm:self-auto"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Aucune notification récente.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.linkTab) setActiveTab(notif.linkTab as any);
              }}
              className={`p-4 flex items-start justify-between gap-3 hover:bg-slate-950/60 transition-colors cursor-pointer ${
                !notif.isRead ? 'bg-blue-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white leading-tight">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">{notif.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
