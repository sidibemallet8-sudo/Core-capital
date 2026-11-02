/**
 * CORE CAPITAL — Module Épargne Virtuelle
 * Plusieurs objectifs, montants déclarés, calcul de progression et versements virtuels.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  History,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const SavingsModule: React.FC = () => {
  const { savingsGoals, addSavingsGoal, depositToSavingsGoal, withdrawFromSavingsGoal, deleteSavingsGoal, userProfile } =
    useFinance();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<{
    goal: SavingsGoal;
    type: 'deposit' | 'withdrawal';
  } | null>(null);

  // Formulaire d'ajout
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('2027-03-31');
  const [goalCategory, setGoalCategory] = useState<SavingsGoal['category']>('urgence');
  const [goalNotes, setGoalNotes] = useState('');

  // Formulaire de versement / retrait
  const [actionAmount, setActionAmount] = useState('');
  const [actionNote, setActionNote] = useState('');

  const totalCurrentSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetSavings = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress =
    totalTargetSavings > 0 ? Math.round((totalCurrentSavings / totalTargetSavings) * 100) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(goalTarget);
    if (!goalTitle.trim() || isNaN(targetNum) || targetNum <= 0) return;

    addSavingsGoal({
      title: goalTitle.trim(),
      targetAmount: targetNum,
      deadline: goalDeadline,
      category: goalCategory,
      notes: goalNotes.trim() || undefined,
    });

    setIsAddGoalOpen(false);
    setGoalTitle('');
    setGoalTarget('');
    setGoalNotes('');
  };

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForAction) return;

    const amountNum = parseFloat(actionAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (selectedGoalForAction.type === 'deposit') {
      depositToSavingsGoal(selectedGoalForAction.goal.id, amountNum, actionNote);
    } else {
      withdrawFromSavingsGoal(selectedGoalForAction.goal.id, amountNum, actionNote);
    }

    setSelectedGoalForAction(null);
    setActionAmount('');
    setActionNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <PiggyBank className="w-4 h-4" />
            <span>MODULE 4 — COFFRES D'ÉPARGNE VIRTUELLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CORE GOALS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Planifiez vos projets personnels (ordinateur, études, commerce, moto, fonds d'urgence). Coffres virtuels déclaratifs.
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel objectif</span>
        </button>
      </div>

      {/* SYNTHÈSE GLOBALE DE L'ÉPARGNE */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Épargne Globale Déclarée</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {totalCurrentSavings.toLocaleString('fr-FR')}
              </span>
              <span className="text-base font-bold text-slate-300 font-mono">
                / {totalTargetSavings.toLocaleString('fr-FR')} {userProfile.currency}
              </span>
            </div>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-xs text-slate-400 block mb-0.5">Progression Globale</span>
            <span className="text-xl font-bold font-mono text-white">{overallProgress}%</span>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Épargne déclarative et virtuelle. Aucun dépôt d’argent réel ni compte bancaire rattaché.
          </span>
        </div>
      </div>

      {/* LISTE DES OBJECTIFS D'ÉPARGNE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{goal.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{goal.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Échéance : {goal.deadline}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSavingsGoal(goal.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Supprimer cet objectif"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    {goal.notes}
                  </p>
                )}

                {/* Barre de progression */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      {goal.currentAmount.toLocaleString('fr-FR')} {userProfile.currency}
                    </span>
                    <span className="text-slate-400">
                      Cible : {goal.targetAmount.toLocaleString('fr-FR')} {userProfile.currency} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress >= 100 ? 'bg-emerald-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    Reste à épargner : <strong className="text-slate-200 font-mono">{remainingAmount.toLocaleString('fr-FR')} {userProfile.currency}</strong>
                  </div>
                </div>
              </div>

              {/* Actions & Historique */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedGoalForAction({ goal, type: 'deposit' })}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 rounded-xl hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Verser</span>
                  </button>
                  <button
                    onClick={() => setSelectedGoalForAction({ goal, type: 'withdrawal' })}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Retirer</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {goal.history.length} mouvement{goal.history.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Création Objectif */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        title="Créer un Objectif d'Épargne"
        subtitle="Définissez un projet ou un fonds de précaution virtuel."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Intitulé de l'objectif *
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Ex : Réserve Imprévus, Achat Moto, Dotation commerce..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Montant cible ({userProfile.currency}) *
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Ex : 50000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date cible *
              </label>
              <input
                type="date"
                required
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catégorie
            </label>
            <select
              value={goalCategory}
              onChange={(e) => setGoalCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="urgence">Fonds d'urgence / Sécurité</option>
              <option value="equipement">Équipement / Matériel de travail</option>
              <option value="commerce">Commerce / Fonds de roulement</option>
              <option value="famille">Famille / Tontine & Fêtes</option>
              <option value="projet">Projet entrepreneurial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes & Stratégie d'épargne
            </label>
            <input
              type="text"
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              placeholder="Ex : 5 000 FCFA alloués chaque mois le jour de paye..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddGoalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              Créer l'objectif
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Versement / Retrait */}
      <Modal
        isOpen={!!selectedGoalForAction}
        onClose={() => setSelectedGoalForAction(null)}
        title={
          selectedGoalForAction?.type === 'deposit'
            ? `Déclarer un Versement : ${selectedGoalForAction.goal.title}`
            : `Déclarer un Retrait : ${selectedGoalForAction?.goal.title}`
        }
        subtitle="Mise à jour déclarative de votre épargne virtuelle."
      >
        <form onSubmit={handleExecuteAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Montant à {selectedGoalForAction?.type === 'deposit' ? 'verser' : 'retirer'} ({userProfile.currency}) *
            </label>
            <input
              type="number"
              required
              min="100"
              step="100"
              value={actionAmount}
              onChange={(e) => setActionAmount(e.target.value)}
              placeholder="Ex : 5000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Motif ou Source du mouvement (optionnel)
            </label>
            <input
              type="text"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Ex : Épargne du salaire du 28, vente d'un article..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedGoalForAction(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer ${
                selectedGoalForAction?.type === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
              }`}
            >
              Confirmer le mouvement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
