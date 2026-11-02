/**
 * CORE CAPITAL — Tableau de Bord Financier
 * Module central : synthèse des revenus, dépenses, solde prévisionnel, alertes et résumé mensuel.
 */

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Calendar,
  PiggyBank,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { ExpensesPieChart } from './ExpensesPieChart';
import { GoogleWorkspacePanel } from '../workspace/GoogleWorkspacePanel';

interface DashboardModuleProps {
  onOpenAddTransaction: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onOpenAddTransaction }) => {
  const {
    financialSummary,
    scheduledExpenses,
    transactions,
    savingsGoals,
    userProfile,
    setActiveTab,
    updateScheduledExpenseStatus,
  } = useFinance();

  const nextPendingExpenses = scheduledExpenses
    .filter((e) => e.status === 'pending')
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. CARTE MAÎTRESSE : SOLDE PRÉVISIONNEL ET SYNTHÈSE DU MOIS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-950 border border-blue-900/40 p-5 sm:p-7 shadow-xl shadow-blue-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/30">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Solde Prévisionnel Déclaré (Novembre 2026)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calcul déterministe : Revenus déclarés - Dépenses prévues
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full font-mono">
              Jour de paye : le {userProfile.salaryDayOfMonth} du mois
            </span>
          </div>
        </div>

        {/* Chiffre Principal */}
        <div className="my-5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Reste à Vivre Net Prévisionnel</span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {financialSummary.projectedNetBalance.toLocaleString('fr-FR')}
              </span>
              <span className="text-lg sm:text-2xl font-bold text-blue-400 font-mono">
                {userProfile.currency}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Soit environ <strong className="text-emerald-400 font-mono font-bold">{financialSummary.remainingDailyBudget.toLocaleString('fr-FR')} {userProfile.currency}</strong> par jour sur 30 jours
            </span>
          </div>

          {/* Indicateur de capacité d'épargne */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Capacité d'Épargne Réserve</span>
              <span className="text-sm font-bold text-white font-mono">
                {financialSummary.savingsRate}% du revenu
              </span>
            </div>
          </div>
        </div>

        {/* 3 Cartes Métriques Déterministes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-blue-900/30">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Revenus déclarés</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
              +{financialSummary.declaredIncome.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
            <span className="text-[10px] text-slate-400">Salaire & rentrées</span>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Dépenses prévues</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-400 font-mono">
              -{financialSummary.projectedExpenses.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
            <span className="text-[10px] text-slate-400">Charges obligatoires & marché</span>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Charges payées ce mois</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-300 font-mono">
              {financialSummary.paidExpenses.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
            <span className="text-[10px] text-slate-400">
              En attente : {financialSummary.pendingExpenses.toLocaleString('fr-FR')} {userProfile.currency}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BANNIÈRE ALERTE INTELLIGENTE IMMÉDIATE */}
      {financialSummary.alerts.length > 0 && (
        <div
          onClick={() => setActiveTab('decision')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-900/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {financialSummary.alerts[0].title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {financialSummary.alerts[0].metric}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {financialSummary.alerts[0].message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>Analyser</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 2b. RÉPARTITION DES DÉPENSES PAR CATÉGORIE (RECHARTS PIE CHART) */}
      <ExpensesPieChart
        scheduledExpenses={scheduledExpenses}
        transactions={transactions}
        currency={userProfile.currency}
      />

      {/* 3. PROCHAINES ÉCHÉANCES RÉCURRENTES & STATUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Prochaines Échéances du Mois</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Marquez vos dépenses au fur et à mesure (déclaré par l'utilisateur).
              </p>
            </div>
            <button
              onClick={() => setActiveTab('money')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Voir tout ({scheduledExpenses.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {nextPendingExpenses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Toutes les échéances prévues pour ce cycle sont déclarées réglées !
              </div>
            ) : (
              nextPendingExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-blue-400 shrink-0">
                      {expense.recurrenceDay}e
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{expense.title}</h3>
                      <span className="text-[11px] text-slate-400">
                        Échéance : {expense.dueDate} · {expense.notes || 'Dépense courante'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <span className="text-sm font-bold font-mono text-white">
                      {expense.amount.toLocaleString('fr-FR')} {userProfile.currency}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateScheduledExpenseStatus(expense.id, 'paid')}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/60 transition-colors cursor-pointer"
                      >
                        Payé
                      </button>
                      <button
                        onClick={() => updateScheduledExpenseStatus(expense.id, 'postponed')}
                        className="px-2 py-1 text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-lg hover:bg-amber-900/50 transition-colors cursor-pointer"
                      >
                        Reporter
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. COLONNE DROITE : ÉPARGNE VIRTUELLE & ACCÈS RAPIDES */}
        <div className="space-y-4">
          {/* Carte Objectifs d'Épargne */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                <span>Épargne Virtuelle</span>
              </h2>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Gérer
              </button>
            </div>

            <div className="space-y-3">
              {savingsGoals.slice(0, 2).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{goal.title}</span>
                      <span className="font-mono text-emerald-400 font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>{goal.currentAmount.toLocaleString('fr-FR')} FCFA</span>
                      <span>Cible : {goal.targetAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raccourcis Modules */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Raccourcis Utiles</span>
            <button
              onClick={() => setActiveTab('money')}
              className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left flex items-center justify-between text-xs text-slate-200 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              <span>CORE MONEY : Gestion & Calendrier de paie</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left flex items-center justify-between text-xs text-slate-200 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              <span>CORE PROJECTS : Projets & Graphiques d'impact</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. INTÉGRATION OFFICIELLE GOOGLE WORKSPACE (DRIVE & SHEETS) */}
      <GoogleWorkspacePanel />
    </div>
  );
};
