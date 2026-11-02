/**
 * CORE CAPITAL — Module Calendrier Financier Intelligent
 * Gère les échéances récurrentes, le salaire mensuel déclaré (50 000 FCFA le 28)
 * et le calcul en direct des dépenses prévues (40 000 FCFA) et du reste à vivre (10 000 FCFA).
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ScheduledExpense, ExpenseStatus } from '../../types';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownCircle,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const CalendarModule: React.FC = () => {
  const {
    scheduledExpenses,
    userProfile,
    financialSummary,
    updateScheduledExpenseStatus,
    deleteScheduledExpense,
    addScheduledExpense,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDay, setNewDay] = useState('1');
  const [newCategory, setNewCategory] = useState<ScheduledExpense['category']>('divers');
  const [newNotes, setNewNotes] = useState('');

  // Tri chronologique des échéances selon le jour du mois (1 à 31)
  const sortedExpenses = [...scheduledExpenses].sort((a, b) => a.recurrenceDay - b.recurrenceDay);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const dayNum = parseInt(newDay, 10) || 1;
    const yearMonth = '2026-11';
    const formattedDay = dayNum.toString().padStart(2, '0');

    addScheduledExpense({
      title: newTitle.trim(),
      amount: amountNum,
      category: newCategory,
      dueDate: `${yearMonth}-${formattedDay}`,
      recurrenceDay: dayNum,
      status: 'pending',
      isRecurring: true,
      isMandatory: true,
      notes: newNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewAmount('');
    setNewDay('1');
    setNewNotes('');
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Payé',
          className: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
          icon: CheckCircle2,
        };
      case 'postponed':
        return {
          label: 'Reporté',
          className: 'bg-amber-950/70 text-amber-300 border-amber-800/80',
          icon: Clock,
        };
      case 'unpaid':
        return {
          label: 'Impayé',
          className: 'bg-rose-950/70 text-rose-300 border-rose-800/80',
          icon: AlertCircle,
        };
      case 'pending':
      default:
        return {
          label: 'Prévu',
          className: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Calendrier Intelligent des Échéances</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Revenus Récurrents & Échéancier Mensuel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Anticipation automatique des paiements du mois et calcul du reste à vivre déterministe.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une échéance</span>
        </button>
      </div>

      {/* SYNTHÈSE DU SCÉNARIO OFFICIEL : 50 000 FCFA SALAIRE -> 40 000 FCFA CHARGES -> 10 000 FCFA RESTE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            Équation Budgétaire du Mois (Novembre 2026)
          </span>
          <span className="text-[11px] text-slate-400">
            Salaire attendu le {userProfile.salaryDayOfMonth} de chaque mois
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-0.5">1. Salaire déclaré</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
              {financialSummary.declaredIncome.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
            <span className="text-[10px] text-slate-400">Revenu mensuel de référence</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-0.5">2. Dépenses prévues</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
              {financialSummary.projectedExpenses.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
            <span className="text-[10px] text-slate-400">Somme des 5 charges déclarées</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-blue-900/60 bg-blue-950/30">
            <span className="text-xs text-blue-300 block mb-0.5">3. Reste à vivre net</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white">
              {financialSummary.projectedNetBalance.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              Calcul automatique ({financialSummary.remainingDailyBudget.toLocaleString('fr-FR')} FCFA/jour)
            </span>
          </div>
        </div>

        {/* Notice légale statut */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Le statut de chaque dépense (Payé, Reporté, Impayé) est déclaré par l’utilisateur et non vérifié par une banque.
          </span>
        </div>
      </div>

      {/* TIMELINE CHRONOLOGIQUE DU MOIS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Chronologie des Échéances du Cycle</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {scheduledExpenses.length} échéances programmées
          </span>
        </div>

        <div className="space-y-3">
          {/* Événement Salaire le 28 */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center font-mono text-sm font-bold text-emerald-300 shrink-0">
                {userProfile.salaryDayOfMonth}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Réception du Salaire Mensuel</h3>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-medium">
                    Entrée Principale
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Déclaré chaque mois le {userProfile.salaryDayOfMonth} · Déclenche le nouveau cycle budgétaire
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold font-mono text-emerald-400">
                +{financialSummary.declaredIncome.toLocaleString('fr-FR')} {userProfile.currency}
              </span>
            </div>
          </div>

          {/* Liste des dépenses déclarées */}
          {sortedExpenses.map((expense) => {
            const badge = getStatusBadge(expense.status);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={expense.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-sm font-bold text-blue-400 shrink-0 mt-0.5 sm:mt-0">
                    {expense.recurrenceDay}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{expense.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${badge.className}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Échéance prévue le {expense.recurrenceDay} du mois {expense.notes ? `· ${expense.notes}` : ''}
                    </p>
                  </div>
                </div>

                {/* Actions de Statut déclaratif & Montant */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                  <span className="text-base font-bold font-mono text-white">
                    {expense.amount.toLocaleString('fr-FR')} {userProfile.currency}
                  </span>

                  {/* Boutons de changement d'état interactifs */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateScheduledExpenseStatus(expense.id, 'paid')}
                      title="Déclarer payé"
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        expense.status === 'paid'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      Payé
                    </button>
                    <button
                      onClick={() => updateScheduledExpenseStatus(expense.id, 'postponed')}
                      title="Déclarer reporté"
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        expense.status === 'postponed'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      Reporté
                    </button>
                    <button
                      onClick={() => updateScheduledExpenseStatus(expense.id, 'unpaid')}
                      title="Déclarer impayé"
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        expense.status === 'unpaid'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      Impayé
                    </button>
                    <button
                      onClick={() => deleteScheduledExpense(expense.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer ml-1"
                      title="Supprimer cette échéance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Ajout d'Échéance */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une Échéance Récurrente"
        subtitle="Déclarez une nouvelle dépense fixe mensuelle à anticiper."
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Intitulé de la dépense *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex : Facture d'eau SDE, Forfait Canal, Tontine..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Montant ({userProfile.currency}) *
              </label>
              <input
                type="number"
                required
                min="100"
                step="100"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Ex : 4000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jour d'échéance (1-31) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catégorie de dépense
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="logement">Loyer & Logement</option>
              <option value="electricite_eau">Électricité & Eau</option>
              <option value="internet_telecom">Internet & Télécom</option>
              <option value="alimentation">Alimentation & Marché</option>
              <option value="transport">Transport & Déplacements</option>
              <option value="sante">Santé & Pharmacie</option>
              <option value="education">Éducation & Scolarité</option>
              <option value="commerce_business">Commerce & Activité</option>
              <option value="loisirs_famille">Famille & Tontine</option>
              <option value="divers">Autre / Divers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes complémentaires (optionnel)
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Ex : Facture bimestrielle, paiement par Wave..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              Enregistrer l'échéance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
