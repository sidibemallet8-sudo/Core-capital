/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CORE CAPITAL V3 — Plateforme Fintech Moderne
 * "Your Money. Your Decisions. Your Future."
 */

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { MoreMenuModal } from './components/common/MoreMenuModal';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AuthModal } from './components/auth/AuthModal';

// Modules V3
import { DashboardModule } from './components/dashboard/DashboardModule';
import { CoreMoneyModule } from './components/money/CoreMoneyModule';
import { CoreDecisionModule } from './components/decision/CoreDecisionModule';
import { CoreVoiceModule } from './components/voice/CoreVoiceModule';
import { SavingsModule } from './components/savings/SavingsModule';
import { CoreBourseModule } from './components/bourse/CoreBourseModule';
import { CoreProjectsModule } from './components/projects/CoreProjectsModule';
import { CoreConnectModule } from './components/connect/CoreConnectModule';
import { NotificationsModule } from './components/notifications/NotificationsModule';
import { AdminModule } from './components/admin/AdminModule';
import { SettingsModule } from './components/settings/SettingsModule';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      {/* 1. Alerte Hors-Ligne & Installation PWA */}
      <OfflineStatusBanner />

      {/* 2. Notice Légale & Déclarative Transparente */}
      <DisclaimerBanner />

      {/* 3. En-tête Top Bar Contract avec icône officielle */}
      <Header
        onOpenQuickAdd={() => setIsAddTxOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 4. Contenu Actif selon le Module */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardModule onOpenAddTransaction={() => setIsAddTxOpen(true)} />
        )}
        {activeTab === 'money' && <CoreMoneyModule />}
        {activeTab === 'decision' && <CoreDecisionModule />}
        {activeTab === 'voice' && <CoreVoiceModule />}
        {activeTab === 'goals' && <SavingsModule />}
        {activeTab === 'bourse' && <CoreBourseModule />}
        {activeTab === 'projects' && <CoreProjectsModule />}
        {activeTab === 'messages' && <CoreConnectModule />}
        {activeTab === 'notifications' && <NotificationsModule />}
        {activeTab === 'admin' && <AdminModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>

      {/* 5. Barre de Navigation Tactile Inférieure (Smartphones & iPhone) */}
      <BottomNav onOpenMoreMenu={() => setIsMoreMenuOpen(true)} />

      {/* 6. Modales Globales */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* 7. Pied de Page */}
      <footer className="hidden md:block border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/core-capital-icon.png" alt="Core Capital" className="w-5 h-5 rounded-md" />
            <span className="text-white font-bold">CORE CAPITAL V3</span>
            <span>· Your Money. Your Decisions. Your Future.</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Persistance locale IndexedDB active · Données déclaratives & consultatives · Aucun dépôt ni garde d’actifs.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
