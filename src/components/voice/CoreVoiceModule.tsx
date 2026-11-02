/**
 * CORE CAPITAL V3 — MODULE 3 : CORE VOICE
 * Interface de saisie vocale multilingue (Français, Bambara, Anglais)
 * Analyse, proposition structurée et confirmation obligatoire avant enregistrement.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { VoiceNLPService } from '../../services/voiceNLPService';
import { VoiceParsedProposal } from '../../types';
import { CATEGORY_LABELS } from '../../services/financialEngine';
import {
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  ArrowRight,
  Globe,
  HelpCircle,
} from 'lucide-react';

export const CoreVoiceModule: React.FC = () => {
  const { addTransaction, userProfile } = useFinance();

  const [language, setLanguage] = useState<'fr' | 'bm' | 'en'>('fr');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [proposal, setProposal] = useState<VoiceParsedProposal | null>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        const parsed = VoiceNLPService.parseTranscript(text, language);
        setProposal(parsed);
      };

      recognition.onerror = (event: any) => {
        console.warn('Erreur reconnaissance vocale:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }
  }, [language]);

  const toggleListen = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setProposal(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleManualAnalyze = (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setTranscript(textToAnalyze);
    const parsed = VoiceNLPService.parseTranscript(textToAnalyze, language);
    setProposal(parsed);
  };

  const handleConfirmAndSave = () => {
    if (!proposal) return;

    addTransaction({
      type: proposal.type,
      title: proposal.title,
      amount: proposal.amount,
      category: proposal.category,
      date: proposal.date,
      isRecurring: false,
      isMandatory: proposal.isMandatory,
      status: proposal.type === 'income' ? 'paid' : 'pending',
      notes: `Enregistré via CORE VOICE : "${proposal.rawTranscript}"`,
    });

    setSavedNotification(
      `Opération enregistrée : ${proposal.type === 'income' ? '+' : '-'}${proposal.amount.toLocaleString('fr-FR')} ${userProfile.currency}`
    );
    setProposal(null);
    setTranscript('');
    setManualInput('');

    setTimeout(() => {
      setSavedNotification(null);
    }, 4000);
  };

  const examplePhrases = [
    { text: 'J’ai reçu 20 000 francs CFA.', lang: 'fr' as const, label: 'Entrée 20 000 FCFA' },
    { text: 'J’ai dépensé 2 000 francs en transport.', lang: 'fr' as const, label: 'Dépense transport 2 000 FCFA' },
    { text: 'Je dois payer mon loyer le 5.', lang: 'fr' as const, label: 'Échéance Loyer le 5' },
    { text: 'N sɔrɔla 20 000 FCFA baaradugu la.', lang: 'bm' as const, label: 'Bambara : N sɔrɔla 20k' },
    { text: 'I spent 5,000 FCFA on food.', lang: 'en' as const, label: 'English : Food expense' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Mic className="w-4 h-4" />
            <span>MODULE 3 — INTERFACE VOCALE INTELLIGENTE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CORE VOICE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Dictez vos opérations financières au naturel. Le système analyse et attend votre confirmation.
          </p>
        </div>

        {/* Sélecteur de langue */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setLanguage('fr')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              language === 'fr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Français
          </button>
          <button
            onClick={() => setLanguage('bm')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              language === 'bm' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bambara
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* ZONE D'INTERACTION VOCALE */}
      <div className="bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/50 rounded-3xl p-6 text-center space-y-6">
        <div className="max-w-md mx-auto space-y-3">
          <div className="relative inline-block">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping" />
            )}
            <button
              onClick={toggleListen}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-600/40 scale-110 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95'
              }`}
              title={isListening ? 'Arrêter l’enregistrement' : 'Commencer à parler'}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div>
            <span className="text-sm font-bold text-white block">
              {isListening ? 'Écoute en cours... Parlez naturellement' : 'Touchez le micro pour dicter'}
            </span>
            <span className="text-xs text-slate-400">
              « J’ai reçu 20 000 FCFA » ou « J’ai dépensé 2 000 en transport »
            </span>
          </div>
        </div>

        {/* Exemples rapides en un clic */}
        <div className="pt-2 border-t border-slate-800/80 max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Ou essayez une phrase type :
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {examplePhrases.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setLanguage(ex.lang);
                  handleManualAnalyze(ex.text);
                }}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                « {ex.text} »
              </button>
            ))}
          </div>
        </div>

        {/* Alternative saisie textuelle si micro non disponible */}
        <div className="pt-2 max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualAnalyze(manualInput)}
            placeholder="Ou tapez votre phrase ici..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleManualAnalyze(manualInput)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Analyser
          </button>
        </div>
      </div>

      {/* PROPOSITION STRUCTURÉE & CONFIRMATION OBLIGATOIRE */}
      {proposal && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-900/60 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">
                Proposition Structurée Extraite — Confirmation Requise
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Confiance : {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
            Phrase entendue : « {proposal.rawTranscript} »
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Type d’opération</span>
              <span
                className={`text-xs font-bold ${
                  proposal.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {proposal.type === 'income' ? 'Entrée / Revenu (+)' : 'Sortie / Dépense (-)'}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Montant Détecté</span>
              <span className="text-sm font-bold font-mono text-white">
                {proposal.amount.toLocaleString('fr-FR')} {userProfile.currency}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Catégorie Attribuée</span>
              <span className="text-xs font-bold text-blue-300">
                {CATEGORY_LABELS[proposal.category] || proposal.category}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Date Déclarée</span>
              <span className="text-xs font-bold font-mono text-slate-200">{proposal.date}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-slate-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Conformément à la règle de sécurité, aucune donnée n'est enregistrée sans votre clic de confirmation.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setProposal(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Rejeter
              </button>
              <button
                onClick={handleConfirmAndSave}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmer et Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
