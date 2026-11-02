/**
 * CORE CAPITAL V3 — Barre de Navigation Mobile Inférieure
 * Optimisée pour écran tactile smartphone & iPhone.
 */

import React from 'react';
import { useFinance, NavTab } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  Wallet,
  Scale,
  TrendingUp,
  Grid,
} from 'lucide-react';

interface BottomNavProps {
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMoreMenu }) => {
  const { activeTab, setActiveTab } = useFinance();

  const primaryTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Synthèse', icon: LayoutDashboard },
    { id: 'money', label: 'Money', icon: Wallet },
    { id: 'decision', label: 'Décision', icon: Scale },
    { id: 'bourse', label: 'Bourse', icon: TrendingUp },
  ];

  const isMoreTab = !primaryTabs.some((t) => t.id === activeTab);

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Bouton Plus / Menu V3 */}
        <button
          onClick={onOpenMoreMenu}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isMoreTab ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className={`w-5 h-5 transition-transform ${isMoreTab ? 'scale-110 text-blue-400' : ''}`} />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
            {activeTab === 'voice'
              ? 'Voix'
              : activeTab === 'goals'
              ? 'Objectifs'
              : activeTab === 'projects'
              ? 'Projets'
              : activeTab === 'messages'
              ? 'Messages'
              : activeTab === 'notifications'
              ? 'Alertes'
              : activeTab === 'admin'
              ? 'Admin'
              : activeTab === 'settings'
              ? 'Profil'
              : 'Modules'}
          </span>
          {isMoreTab && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
