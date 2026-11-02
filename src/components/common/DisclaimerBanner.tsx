/**
 * CORE CAPITAL — Bandeau de Conformité & Règles Essentielles
 * Rappelle de façon transparente et permanente la nature déclarative de l'application.
 */

import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        aria-label="Afficher la notice de conformité financière"
      >
        <Info className="w-3.5 h-3.5 text-blue-400" />
        <span>Notice légale & Déclarations financières (cliquez pour développer)</span>
      </button>
    );
  }

  return (
    <div className="bg-slate-900/95 border-b border-blue-900/40 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-6xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-tight text-slate-300">
            <strong className="text-white font-medium">CORE CAPITAL V1 :</strong> Outil d’organisation et d’anticipation budgétaire personnelle.
            <span className="text-slate-400 ml-1">
              Aucun dépôt ni transfert d’argent réel · Aucun paiement bancaire · Tous les soldes sont déclarés ou prévisionnels et non vérifiés par une banque · Aucun rendement garanti.
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
          aria-label="Masquer la notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
