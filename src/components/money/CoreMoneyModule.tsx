/**
 * CORE CAPITAL V3 — MODULE 1 : CORE MONEY
 * Gestion complète des sources de revenus multiples, des charges obligatoires & facultatives,
 * des dettes/engagements et du calendrier financier.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { IncomeSource, ScheduledExpense, ExpenseStatus } from '../../types';
import { CATEGORY_LABELS } from '../../services/financialEngine';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Lock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Download,
} from 'lucide-react';
import { csvExportService } from '../../services/csvExportService';
import { Modal } from '../common/Modal';

export const CoreMoneyModule: React.FC = () => {
  const {
    financialSummary,
    incomeSources,
    addIncomeSource,
    deleteIncomeSource,
    scheduledExpenses,
    addScheduledExpense,
    updateScheduledExpenseStatus,
    deleteScheduledExpense,
    userProfile,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'incomes' | 'expenses' | 'debts'>('overview');
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Formulaire Revenu
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incNature, setIncNature] = useState<IncomeSource['nature']>('fixed');
  const [incFreq, setIncFreq] = useState<IncomeSource['frequency']>('monthly');
  const [incDay, setIncDay] = useState('28');

  // Formulaire Dépense
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ScheduledExpense['category']>('logement');
  const [expDay, setExpDay] = useState('5');
  const [expIsMandatory, setExpIsMandatory] = useState(true);
  const [expIsDebt, setExpIsDebt] = useState(false);
  const [expCreditor, setExpCreditor] = useState('');

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(incAmount);
    if (!incTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addIncomeSource({
      title: incTitle.trim(),
      amount: amountNum,
      nature: incNature,
      frequency: incFreq,
      receptionDay: parseInt(incDay, 10) || 28,
      category: 'salaire',
      isActive: true,
    });

    setIsAddIncomeModalOpen(false);
    setIncTitle('');
    setIncAmount('');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const dayNum = parseInt(expDay, 10) || 1;
    const yearMonth = '2026-11';
    const formattedDay = dayNum.toString().padStart(2, '0');

    addScheduledExpense({
      title: expTitle.trim(),
      amount: amountNum,
      category: expCategory,
      dueDate: `${yearMonth}-${formattedDay}`,
      recurrenceDay: dayNum,
      status: 'pending',
      isRecurring: true,
      isMandatory: expIsMandatory,
      isDebt: expIsDebt,
      creditorName: expIsDebt ? expCreditor : undefined,
    });

    setIsAddExpenseModalOpen(false);
    setExpTitle('');
    setExpAmount('');
    setExpCreditor('');
    setExpIsDebt(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>MODULE 1 — GESTION BUDGÉTAIRE INTÉGRALE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CORE MONEY
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organisation des rentrées fixes & irrégulières, verrouillage des obligations et calendrier d'échéances.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => csvExportService.exportExpensesToCsv(scheduledExpenses, userProfile.currency)}
            title="Exporter les charges au format CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddIncomeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 rounded-xl hover:bg-emerald-900/60 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Revenu</span>
          </button>
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dépense / Dette</span>
          </button>
        </div>
      </div>

      {/* SYNTHÈSE DES 8 CALCULS DETERMINISTES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Revenus déclarés */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">1. Revenus déclarés</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
            +{financialSummary.declaredIncome.toLocaleString('fr-FR')} {userProfile.currency}
          </div>
          <span className="text-[10px] text-slate-400">
            Fixe: {financialSummary.fixedIncome.toLocaleString('fr-FR')} · Irreg: {financialSummary.irregularIncome.toLocaleString('fr-FR')}
          </span>
        </div>

        {/* 2. Dépenses obligatoires */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">2. Réservé aux obligations</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
            -{financialSummary.reservedForObligations.toLocaleString('fr-FR')} {userProfile.currency}
          </div>
          <span className="text-[10px] text-rose-300 font-medium">Charges vitales & dettes</span>
        </div>

        {/* 3. Dépenses facultatives */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">3. Dépenses facultatives</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-300">
            -{financialSummary.optionalExpenses.toLocaleString('fr-FR')} {userProfile.currency}
          </div>
          <span className="text-[10px] text-slate-400">Loisirs arbitrables</span>
        </div>

        {/* 4. Solde Prévisionnel & Reste à vivre */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-900/60">
          <span className="text-[11px] text-blue-300 block mb-1">4. Reste à vivre net</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white">
            {financialSummary.projectedNetBalance.toLocaleString('fr-FR')} {userProfile.currency}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            ~{financialSummary.remainingDailyBudget.toLocaleString('fr-FR')} FCFA/jour
          </span>
        </div>
      </div>

      {/* Onglets sous-rubriques */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto max-w-lg">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Calendrier des Échéances
        </button>
        <button
          onClick={() => setActiveSubTab('incomes')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'incomes' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sources de Revenus ({incomeSources.length})
        </button>
        <button
          onClick={() => setActiveSubTab('debts')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'debts' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dettes & Engagements ({scheduledExpenses.filter((s) => s.isDebt).length})
        </button>
      </div>

      {/* SOUS-ONGLET 1 : CALENDRIER & STATUTS DES CHARGES */}
      {activeSubTab === 'overview' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Échéancier Mensuel & Statuts Déclarés</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Marquez chaque dépense comme Payée, Reportée ou Impayée. Statut déclaratif non vérifié par une banque.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {scheduledExpenses.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                <Wallet className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-white">Aucune opération enregistrée.</p>
                <p className="text-xs text-slate-400">Ajoutez votre premier revenu ou votre première dépense pour activer votre tableau de bord.</p>
              </div>
            ) : (
              scheduledExpenses.map((expense) => {
              const isPaid = expense.status === 'paid';
              const isPostponed = expense.status === 'postponed';
              const isUnpaid = expense.status === 'unpaid';

              return (
                <div
                  key={expense.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-blue-400 shrink-0">
                      {expense.recurrenceDay}e
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{expense.title}</h3>
                        {expense.isMandatory ? (
                          <span className="text-[10px] text-rose-300 bg-rose-950/60 border border-rose-900 px-1.5 py-0.2 rounded font-medium">
                            Obligatoire
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded font-medium">
                            Facultatif
                          </span>
                        )}
                        {expense.isDebt && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800 px-1.5 py-0.2 rounded font-medium">
                            Dette active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Échéance : {expense.dueDate} {expense.notes ? `· ${expense.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <span className="text-base font-bold font-mono text-white">
                      {expense.amount.toLocaleString('fr-FR')} {userProfile.currency}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateScheduledExpenseStatus(expense.id, 'paid')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                          isPaid ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        Payé
                      </button>
                      <button
                        onClick={() => updateScheduledExpenseStatus(expense.id, 'postponed')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                          isPostponed ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        Reporté
                      </button>
                      <button
                        onClick={() => updateScheduledExpenseStatus(expense.id, 'unpaid')}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                          isUnpaid ? 'bg-rose-600 text-white font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        Impayé
                      </button>
                      <button
                        onClick={() => deleteScheduledExpense(expense.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* SOUS-ONGLET 2 : SOURCES DE REVENUS */}
      {activeSubTab === 'incomes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Sources de Revenus Multiples</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Déclarez vos rentrées fixes (salaire) et irrégulières (prestations, ventes).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => csvExportService.exportIncomesToCsv(incomeSources, userProfile.currency)}
                title="Exporter les revenus au format CSV"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => setIsAddIncomeModalOpen(true)}
                className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                + Ajouter une source
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomeSources.length === 0 ? (
              <div className="col-span-full py-12 px-4 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-white">Aucune source de revenu enregistrée.</p>
                <p className="text-xs text-slate-400">Déclarez votre salaire ou vos revenus pour calculer votre solde prévisionnel.</p>
              </div>
            ) : (
              incomeSources.map((inc) => (
              <div key={inc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                    <span className="text-xs text-slate-400">
                      {inc.nature === 'fixed' ? 'Revenu Fixe' : 'Revenu Irrégulier'} · Fréquence : {inc.frequency}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteIncomeSource(inc.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Attendu vers le {inc.receptionDay || 28} du mois</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    +{inc.amount.toLocaleString('fr-FR')} {userProfile.currency}
                  </span>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* SOUS-ONGLET 3 : DETTES & ENGAGEMENTS */}
      {activeSubTab === 'debts' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Dettes & Engagements Remboursables</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Suivi transparent des sommes dues (tontines, prêts de proches, créanciers).
              </p>
            </div>
          </div>

          {scheduledExpenses.filter((s) => s.isDebt).length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Aucune dette ou engagement déclaré actuellement.
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledExpenses
                .filter((s) => s.isDebt)
                .map((debt) => (
                  <div key={debt.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-white">{debt.title}</h3>
                        <span className="text-xs text-slate-400">
                          Créancier : {debt.creditorName || 'Non spécifié'} · Échéance : le {debt.recurrenceDay}
                        </span>
                      </div>
                      <span className="text-sm font-bold font-mono text-amber-400">
                        {debt.amount.toLocaleString('fr-FR')} {userProfile.currency} / mois
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Ajout Source de Revenu */}
      <Modal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        title="Ajouter une Source de Revenu"
        subtitle="Déclarez une nouvelle rentrée d'argent fixe ou irrégulière."
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Titre de la source *</label>
            <input
              type="text"
              required
              value={incTitle}
              onChange={(e) => setIncTitle(e.target.value)}
              placeholder="Ex : Salaire, Prime, Ventes en ligne..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Montant ({userProfile.currency}) *</label>
              <input
                type="number"
                required
                min="500"
                value={incAmount}
                onChange={(e) => setIncAmount(e.target.value)}
                placeholder="50000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jour habituel de versement</label>
              <input
                type="number"
                min="1"
                max="31"
                value={incDay}
                onChange={(e) => setIncDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nature</label>
              <select
                value={incNature}
                onChange={(e) => setIncNature(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="fixed">Fixe (Garantie)</option>
                <option value="irregular">Irrégulière (Variable)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fréquence</label>
              <select
                value={incFreq}
                onChange={(e) => setIncFreq(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="monthly">Mensuelle</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="variable">Ponctuelle / Variable</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddIncomeModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Enregistrer la rentrée
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajout Dépense / Dette */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        title="Ajouter une Charge ou Dette"
        subtitle="Déclarez une dépense obligatoire ou facultative."
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Intitulé *</label>
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="Ex : Loyer, Remboursement avance, Eau..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Montant ({userProfile.currency}) *</label>
              <input
                type="number"
                required
                min="100"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="15000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jour d'échéance (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={expDay}
                onChange={(e) => setExpDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMandatoryCheck"
                checked={expIsMandatory}
                onChange={(e) => setExpIsMandatory(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <label htmlFor="isMandatoryCheck" className="text-xs text-slate-300 cursor-pointer">
                Dépense obligatoire (incompressible)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDebtCheck"
                checked={expIsDebt}
                onChange={(e) => setExpIsDebt(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <label htmlFor="isDebtCheck" className="text-xs text-slate-300 cursor-pointer">
                Il s’agit d’une dette ou d’un engagement financier à solder
              </label>
            </div>
          </div>

          {expIsDebt && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du créancier</label>
              <input
                type="text"
                value={expCreditor}
                onChange={(e) => setExpCreditor(e.target.value)}
                placeholder="Ex : M. Diallo, Tontine des commerçants..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Enregistrer la charge
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
