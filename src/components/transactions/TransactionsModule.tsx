/**
 * CORE CAPITAL — Module Revenus & Dépenses
 * Ajout, modification, suppression, catégories et historique complet.
 */

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, AnyCategory } from '../../types';
import { CATEGORY_LABELS } from '../../services/financialEngine';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';

interface TransactionsModuleProps {
  onOpenAddModal: () => void;
}

export const TransactionsModule: React.FC<TransactionsModuleProps> = ({ onOpenAddModal }) => {
  const { transactions, deleteTransaction, userProfile } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filtrage réactif
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, filterType, filterCategory]);

  const totalFilteredIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Historique des Flux Financiers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Revenus & Dépenses Déclarés
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consultez, filtrez et catégorisez toutes vos entrées et sorties déclarées.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle opération</span>
        </button>
      </div>

      {/* Cartes Totaux Filtrés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Total Entrées Filtrées</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              +{totalFilteredIncome.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Total Sorties Filtrées</span>
            <div className="text-xl font-bold font-mono text-rose-400">
              -{totalFilteredExpense.toLocaleString('fr-FR')} {userProfile.currency}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres Segmentés */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Recherche textuelle */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une opération (titre, note)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtres par Type (Boutons segmentés conformes) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'income'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revenus
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dépenses
            </button>
          </div>
        </div>
      </div>

      {/* Liste des Opérations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs sm:text-sm space-y-2">
            <p>Aucune transaction ne correspond à vos critères de recherche.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterCategory('all');
              }}
              className="text-blue-400 hover:underline text-xs cursor-pointer font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const categoryLabel = CATEGORY_LABELS[tx.category] || tx.category;

            return (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-950/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                      isIncome
                        ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                        : 'bg-rose-950/60 border border-rose-800/60 text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{tx.title}</h3>
                      {tx.isRecurring && (
                        <span className="text-[10px] text-blue-400 bg-blue-950/80 border border-blue-900 px-1.5 py-0.2 rounded font-mono">
                          Récurrent
                        </span>
                      )}
                    </div>
                    {/* Unboxed metadata separated by middots per design discipline */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span>{categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.date}</span>
                      {tx.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400 italic line-clamp-1">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span
                    className={`text-base font-bold font-mono ${
                      isIncome ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {tx.amount.toLocaleString('fr-FR')} {userProfile.currency}
                  </span>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Supprimer cette opération"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
