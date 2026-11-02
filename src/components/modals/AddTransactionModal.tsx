/**
 * CORE CAPITAL — Modal d'Ajout Rapide de Transaction (Revenu ou Dépense)
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { TransactionType, AnyCategory } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, userProfile } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<AnyCategory>('alimentation');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!title.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addTransaction({
      type,
      title: title.trim(),
      amount: amountNum,
      category,
      date,
      isRecurring,
      status: type === 'income' ? 'paid' : 'pending',
      notes: notes.trim() || undefined,
    });

    onClose();
    setTitle('');
    setAmount('');
    setNotes('');
    setIsRecurring(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer une Opération"
      subtitle="Déclarez une entrée ou sortie de fonds pour actualiser votre solde."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélecteur de type Revenu vs Dépense */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('alimentation');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-950 text-rose-300 border border-rose-900/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sortie / Dépense (-)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('salaire');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrée / Revenu (+)
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Intitulé *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'expense'
                ? 'Ex : Courses marché, Recharge Woyofal, Carburant...'
                : 'Ex : Salaire, Prime, Vente marchandise...'
            }
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex : 5000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {type === 'expense' ? (
              <>
                <option value="alimentation">Alimentation & Marché</option>
                <option value="logement">Loyer & Logement</option>
                <option value="electricite_eau">Électricité & Eau</option>
                <option value="internet_telecom">Internet & Télécom</option>
                <option value="transport">Transport & Déplacements</option>
                <option value="sante">Santé & Pharmacie</option>
                <option value="education">Éducation & Scolarité</option>
                <option value="commerce_business">Commerce & Activité</option>
                <option value="loisirs_famille">Famille, Fêtes & Tontines</option>
                <option value="divers">Autre / Divers</option>
              </>
            ) : (
              <>
                <option value="salaire">Salaire & Émoluments</option>
                <option value="commerce_ventes">Ventes de Marchandises</option>
                <option value="freelance_service">Prestations & Services</option>
                <option value="activite_secondaire">Activité d'Appoint</option>
                <option value="transfert_aide">Aides familiales / Tontines</option>
                <option value="divers_revenu">Autre Rentrée</option>
              </>
            )}
          </select>
        </div>

        {/* Option récurrente */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurringCheck"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="isRecurringCheck" className="text-xs text-slate-300 cursor-pointer">
            Opération mensuelle récurrente (à synchroniser avec le calendrier)
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Notes complémentaires (optionnel)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex : Référence de virement, paiement Wave, reçu..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
            }`}
          >
            Enregistrer l'opération
          </button>
        </div>
      </form>
    </Modal>
  );
};
