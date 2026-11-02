/**
 * CORE CAPITAL V3 — Menu Tiroir des Modules
 * Accès direct à l'ensemble des 11 modules de la plateforme.
 */

import React from 'react';
import { useFinance, NavTab } from '../../context/FinanceContext';
import { Modal } from './Modal';
import {
  Mic,
  PiggyBank,
  Briefcase,
  MessageSquare,
  Bell,
  ShieldAlert,
  Settings,
  ChevronRight,
  TrendingUp,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, resetAllToDefault, unreadNotificationsCount } = useFinance();

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    onClose();
  };

  const modulesList: {
    id: NavTab;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string | number;
  }[] = [
    {
      id: 'voice',
      title: 'MODULE 3 — CORE VOICE',
      subtitle: 'Saisie vocale intelligente (Français, Bambara, Anglais)',
      icon: Mic,
      color: 'text-blue-400 bg-blue-950/80 border-blue-900',
    },
    {
      id: 'decision',
      title: 'MODULE 2 — CORE DECISION',
      subtitle: 'Simulateur : « Puis-je me le permettre ? »',
      icon: Scale,
      color: 'text-amber-400 bg-amber-950/80 border-amber-900',
    },
    {
      id: 'goals',
      title: 'MODULE 4 — CORE GOALS',
      subtitle: 'Coffres d’épargne virtuelle & projets personnels',
      icon: PiggyBank,
      color: 'text-emerald-400 bg-emerald-950/80 border-emerald-900',
    },
    {
      id: 'projects',
      title: 'MODULE 6 & 7 — CORE PROJECTS',
      subtitle: 'Marché de projets économiques & graphiques d’impact',
      icon: Briefcase,
      color: 'text-purple-400 bg-purple-950/80 border-purple-900',
    },
    {
      id: 'messages',
      title: 'MODULE 8 — CORE CONNECT',
      subtitle: 'Messagerie directe avec les porteurs de projets',
      icon: MessageSquare,
      color: 'text-cyan-400 bg-cyan-950/80 border-cyan-900',
    },
    {
      id: 'notifications',
      title: 'MODULE 10 — NOTIFICATIONS',
      subtitle: 'Rappels d’échéances, rentrées et alertes marchés',
      icon: Bell,
      color: 'text-rose-400 bg-rose-950/80 border-rose-900',
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: 'admin',
      title: 'MODULE 11 — ADMINISTRATION',
      subtitle: 'Modération, contrôle documentaire et journal d’audit',
      icon: ShieldAlert,
      color: 'text-slate-300 bg-slate-900 border-slate-800',
    },
    {
      id: 'settings',
      title: 'PROFIL & PARAMÈTRES',
      subtitle: 'Devise FCFA, synchronisation IndexedDB et Supabase',
      icon: Settings,
      color: 'text-slate-400 bg-slate-950 border-slate-800',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Écosystème CORE CAPITAL V3"
      subtitle="Sélectionnez un module financier ou économique."
      maxWidth="lg"
    >
      <div className="space-y-2">
        {modulesList.map((mod) => {
          const Icon = mod.icon;
          const isSelected = activeTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => handleSelectTab(mod.id)}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/60 border-blue-600 text-white shadow-md'
                  : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${mod.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold tracking-tight block">{mod.title}</span>
                    {mod.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block line-clamp-1">{mod.subtitle}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          );
        })}

        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={async () => {
              await resetAllToDefault();
              onClose();
            }}
            className="w-full py-2.5 px-3 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données de référence</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
