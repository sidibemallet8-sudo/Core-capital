/**
 * CORE CAPITAL — Répartition des Dépenses par Catégorie (Pie Chart Recharts)
 * Graphique en secteurs interactif avec infobulle fintech, pourcentages et légende détaillée.
 */

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ScheduledExpense, Transaction } from '../../types';
import { CATEGORY_LABELS } from '../../services/financialEngine';
import { PieChart as PieChartIcon, Filter, Layers } from 'lucide-react';

interface ExpensesPieChartProps {
  scheduledExpenses: ScheduledExpense[];
  transactions: Transaction[];
  currency: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  logement: '#3b82f6', // Bleu vif
  alimentation: '#10b981', // Émeraude
  transport: '#f59e0b', // Ambre
  electricite_eau: '#06b6d4', // Cyan
  internet_telecom: '#8b5cf6', // Violet
  sante: '#ef4444', // Rouge corail
  education: '#6366f1', // Indigo
  dette_remboursement: '#f97316', // Orange
  commerce_business: '#14b8a6', // Teal
  loisirs_famille: '#ec4899', // Rose
  divers: '#64748b', // Ardoise
};

const DEFAULT_COLOR = '#94a3b8';

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({
  scheduledExpenses,
  transactions,
  currency,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Agrégation des montants par catégorie
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    // 1. Dépenses calendaires récurrentes
    scheduledExpenses.forEach((exp) => {
      if (filterMode === 'mandatory' && !exp.isMandatory) return;
      if (filterMode === 'optional' && exp.isMandatory) return;

      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    // 2. Dépenses ponctuelles de transactions si pas déjà couvertes
    transactions
      .filter((t) => t.type === 'expense' && !t.isRecurring)
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const data = Object.entries(categoryTotals)
      .map(([catKey, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return {
          key: catKey,
          name: CATEGORY_LABELS[catKey] || catKey,
          amount,
          percentage: parseFloat(percentage.toFixed(1)),
          color: CATEGORY_COLORS[catKey] || DEFAULT_COLOR,
        };
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { items: data, total };
  }, [scheduledExpenses, transactions, filterMode]);

  // Infobulle sur mesure avec design fintech
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs font-sans space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-white">{data.name}</span>
          </div>
          <div className="text-slate-300 font-mono text-sm font-semibold">
            {data.amount.toLocaleString('fr-FR')} {currency}
          </div>
          <div className="text-blue-400 font-medium text-[11px]">
            {data.percentage}% du total des dépenses
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* En-tête du graphique */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-blue-400" />
            <span>Répartition des Dépenses par Catégorie</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyse sectorielle de vos charges réelles et prévisionnelles
          </p>
        </div>

        {/* Filtres : Toutes, Obligatoires, Facultatives */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilterMode('mandatory')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'mandatory'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Obligatoires
          </button>
          <button
            onClick={() => setFilterMode('optional')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'optional'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Facultatives
          </button>
        </div>
      </div>

      {chartData.items.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">
            Aucune dépense enregistrée dans ce filtre. Ajoutez votre première dépense pour visualiser le graphique en secteurs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Graphique Pie Chart Recharts */}
          <div className="md:col-span-7 h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.items}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.items.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.key}`}
                      fill={entry.color}
                      stroke="#0f172a"
                      strokeWidth={activeIndex === index ? 3 : 1.5}
                      className="cursor-pointer transition-all duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre du Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Total Charges
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                {chartData.total.toLocaleString('fr-FR')}
              </span>
              <span className="text-[10px] text-blue-400 font-mono font-medium">
                {currency}
              </span>
            </div>
          </div>

          {/* Liste détaillée des catégories avec barres de proportion */}
          <div className="md:col-span-5 space-y-2 max-h-64 overflow-y-auto pr-1">
            {chartData.items.map((cat, idx) => (
              <div
                key={cat.key}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-slate-800/80 border border-slate-700'
                    : 'bg-slate-950/60 border border-slate-800/60 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-200 truncate">{cat.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white shrink-0 ml-2">
                    {cat.amount.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mr-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <span className="shrink-0">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
