/**
 * CORE CAPITAL V3 — MODULE 2 : CORE DECISION
 * Fonctionnalité centrale : « Puis-je me le permettre ? »
 * Analyse prédictive déterministe avant d'engager une dépense.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { DecisionAnalysisResult } from '../../types';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

export const CoreDecisionModule: React.FC = () => {
  const { runDecisionAnalysis, financialSummary, userProfile } = useFinance();

  // Entrées configurables de l'analyse
  const [purchaseTitle, setPurchaseTitle] = useState('Téléphone de travail ou nouvel équipement');
  const [purchaseAmount, setPurchaseAmount] = useState('15000');
  const [availableCash, setAvailableCash] = useState('25000');
  const [nextIncomeAmount, setNextIncomeAmount] = useState(
    financialSummary.declaredIncome.toString() || '50000'
  );
  const [daysUntilNextIncome, setDaysUntilNextIncome] = useState('18');
  const [upcomingObligations, setUpcomingObligations] = useState(
    financialSummary.reservedForObligations.toString() || '20000'
  );
  const [upcomingDebts, setUpcomingDebts] = useState(
    financialSummary.debtsTotal.toString() || '5000'
  );

  const [result, setResult] = useState<DecisionAnalysisResult | null>(() => {
    return runDecisionAnalysis({
      availableCash: 25000,
      nextIncomeAmount: 50000,
      daysUntilNextIncome: 18,
      upcomingMandatoryExpenses: 15000,
      upcomingDebts: 5000,
      purchaseAmount: 15000,
      purchaseTitle: 'Téléphone de travail ou nouvel équipement',
    });
  });

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const purchaseNum = parseFloat(purchaseAmount) || 0;
    const cashNum = parseFloat(availableCash) || 0;
    const incomeNum = parseFloat(nextIncomeAmount) || 0;
    const daysNum = parseInt(daysUntilNextIncome, 10) || 1;
    const obligNum = parseFloat(upcomingObligations) || 0;
    const debtsNum = parseFloat(upcomingDebts) || 0;

    const res = runDecisionAnalysis({
      availableCash: cashNum,
      nextIncomeAmount: incomeNum,
      daysUntilNextIncome: daysNum,
      upcomingMandatoryExpenses: obligNum,
      upcomingDebts: debtsNum,
      purchaseAmount: purchaseNum,
      purchaseTitle: purchaseTitle.trim() || 'Achat envisagé',
    });
    setResult(res);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>MODULE 2 — ARBITRAGE & SÉCURISATION BUDGÉTAIRE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CORE DECISION : « Puis-je me le permettre ? »
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Testez un achat avant d’engager vos liquidités pour préserver vos obligations jusqu'à la paie.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulaire de simulation (Gauche) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Paramètres de l'Achat Envisagé</span>
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Objet ou projet de dépense
              </label>
              <input
                type="text"
                required
                value={purchaseTitle}
                onChange={(e) => setPurchaseTitle(e.target.value)}
                placeholder="Ex : Réparation moto, habit de fête, outillage..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Montant de l'achat ({userProfile.currency}) *
              </label>
              <input
                type="number"
                required
                min="100"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Votre Situation de Trésorerie Déclarée
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Argent disponible actuel</label>
                  <input
                    type="number"
                    value={availableCash}
                    onChange={(e) => setAvailableCash(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Jours avant rentrée</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={daysUntilNextIncome}
                    onChange={(e) => setDaysUntilNextIncome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Prochain revenu ({userProfile.currency})</label>
                  <input
                    type="number"
                    value={nextIncomeAmount}
                    onChange={(e) => setNextIncomeAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Obligations vitales d'ici là</label>
                  <input
                    type="number"
                    value={upcomingObligations}
                    onChange={(e) => setUpcomingObligations(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />
              <span>Analyser les conséquences</span>
            </button>
          </form>
        </div>

        {/* Verdict & Explications Déterministes (Droite) */}
        <div className="lg:col-span-7 space-y-4">
          {result && (
            <div
              className={`p-5 rounded-2xl border transition-all ${
                result.verdict === 'feasible_now'
                  ? 'bg-emerald-950/20 border-emerald-800/80'
                  : result.verdict === 'postpone'
                  ? 'bg-amber-950/20 border-amber-800/80'
                  : 'bg-rose-950/25 border-rose-800/80'
              }`}
            >
              {/* Entête du Verdict */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-800/60">
                {result.verdict === 'feasible_now' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : result.verdict === 'postpone' ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      result.verdict === 'feasible_now'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : result.verdict === 'postpone'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {result.verdict === 'feasible_now'
                      ? 'Option 1 : Achat Envisageable Maintenant'
                      : result.verdict === 'postpone'
                      ? 'Option 2 : Achat à Reporter'
                      : 'Option 3 : Choisir une Option Moins Chère'}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {result.verdictTitle}
                  </h3>
                </div>
              </div>

              {/* 4 Indicateurs Clés de l'Analyse */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Solde après achat</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-white">
                    {result.estimatedRemainingBalance.toLocaleString('fr-FR')} {userProfile.currency}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Marge de sécurité</span>
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      result.safetyMarginRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.safetyMarginRemaining.toLocaleString('fr-FR')} {userProfile.currency}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Obligations restantes</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-slate-300">
                    {result.remainingObligations.toLocaleString('fr-FR')} {userProfile.currency}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Risque de liquidité</span>
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      result.liquidityRiskPercentage > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.liquidityRiskPercentage}%
                  </span>
                </div>
              </div>

              {/* Explications Étape par Étape */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Pourquoi cette conclusion déterministe ?
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.detailedReasoning.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommandation concrète */}
              <div className="mt-4 p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-slate-200">
                  <strong className="text-white">Conseil pratique :</strong> {result.concreteAdvice}
                </p>
              </div>
            </div>
          )}

          {/* Règle Déontologique */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Cette simulation est un outil d'aide à la décision fondé sur des calculs arithmétiques stricts. Elle ne garantit aucune situation financière future et ne remplace pas votre discernement personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
