/**
 * CORE CAPITAL V3 — En-tête Principal & Navigation Desktop
 * "Your Money. Your Decisions. Your Future."
 * Affiche l'icône officielle de l'application et les liens d'accès direct.
 */

import React from 'react';
import { useFinance, NavTab } from '../../context/FinanceContext';
import {
  Bell,
  Sun,
  Moon,
  MessageSquare,
  ShieldAlert,
  Mic,
  SlidersHorizontal,
  Plus,
  User,
} from 'lucide-react';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAdd, onOpenAuth }) => {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    updateUserProfile,
    unreadNotificationsCount,
    isOfflineReady,
  } = useFinance();

  const toggleTheme = () => {
    updateUserProfile({ theme: userProfile.theme === 'dark' ? 'light' : 'dark' });
  };

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Synthèse' },
    { id: 'money', label: 'CORE MONEY' },
    { id: 'decision', label: 'CORE DECISION' },
    { id: 'voice', label: 'CORE VOICE' },
    { id: 'goals', label: 'CORE GOALS' },
    { id: 'bourse', label: 'CORE BOURSE' },
    { id: 'projects', label: 'CORE PROJECTS' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Logo officiel & Slogan */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <img
              src="/core-capital-icon.png"
              alt="CORE CAPITAL Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors whitespace-nowrap block leading-tight">
                CORE CAPITAL
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-tight">
                Your Money. Your Decisions. Your Future.
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation desktop (masquée sur mobile) */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-400">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-blue-400 border-b-2 border-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Raccourcis, Notifications & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Badge statut IndexedDB */}
          <div
            title="Persistance locale IndexedDB active : vos données sont consultables hors-ligne"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-slate-400 bg-slate-900/80 border border-slate-800 rounded-lg"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IndexedDB Sync</span>
          </div>

          {/* Bouton Saisie Vocale rapide */}
          <button
            onClick={() => setActiveTab('voice')}
            title="Saisie vocale CORE VOICE"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Messagerie */}
          <button
            onClick={() => setActiveTab('messages')}
            title="CORE CONNECT — Messagerie projets"
            className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            title="Centre de notifications"
            className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Thème */}
          <button
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {userProfile.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {/* Compte Utilisateur & Auth */}
          <button
            onClick={onOpenAuth}
            title={`Compte: ${userProfile.fullName || 'Connexion'}`}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="hidden sm:inline font-medium max-w-[100px] truncate">
              {userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'Compte'}
            </span>
          </button>

          {/* Bouton Ajouter Opération */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter flux</span>
            <span className="sm:hidden">Ajout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
