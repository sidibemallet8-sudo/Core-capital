/**
 * CORE CAPITAL V3 — Moteur de Saisie Vocale & NLP
 * "Your Money. Your Decisions. Your Future."
 * Comprend les phrases en français, bambara et anglais, extrait les entités
 * et formule une proposition structurée à confirmer obligatoirement.
 */

import { VoiceParsedProposal, TransactionType, AnyCategory } from '../types';

export class VoiceNLPService {
  /**
   * Analyse une transcription vocale brute et extrait les entités
   */
  public static parseTranscript(rawText: string, targetLanguage: 'fr' | 'bm' | 'en' = 'fr'): VoiceParsedProposal {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    // 1. Détection du type d'opération
    let type: TransactionType = 'expense';
    let isMandatory = true;

    // Détection en français
    const incomeKeywordsFr = ['reçu', 'gagné', 'encaissé', 'rentrée', 'touché', 'salaire', 'vente', 'vendu', 'prime', 'aide', 'tontine reçue'];
    const expenseKeywordsFr = ['dépensé', 'payé', 'acheté', 'achat', 'coûté', 'dois payer', 'versé', 'réglé', 'facture', 'remboursé'];

    // Détection en bambara (mots clés de base)
    const incomeKeywordsBm = ['sɔrɔla', 'sorola', 'kɛra', 'sɔrɔ'];
    const expenseKeywordsBm = ['bɔra', 'sara', 'sarala', 'san'];

    // Détection en anglais
    const incomeKeywordsEn = ['received', 'earned', 'got', 'income', 'salary', 'sold', 'bonus'];
    const expenseKeywordsEn = ['spent', 'paid', 'bought', 'cost', 'owe', 'expense', 'fee', 'rent'];

    const hasIncomeFr = incomeKeywordsFr.some((k) => lower.includes(k));
    const hasIncomeBm = incomeKeywordsBm.some((k) => lower.includes(k));
    const hasIncomeEn = incomeKeywordsEn.some((k) => lower.includes(k));

    if (hasIncomeFr || hasIncomeBm || hasIncomeEn) {
      type = 'income';
    } else {
      type = 'expense';
    }

    // 2. Extraction du montant (ex: 20 000, 20000, 2 000, 50k, 15000)
    let amount = 0;
    // Motif nombres avec espaces possibles : 20 000 ou 20000 ou 20k
    const cleanNumbersText = lower
      .replace(/(\d+)\s+(\d{3})/g, '$1$2')
      .replace(/(\d+)\s*k/g, (_, n) => `${parseInt(n, 10) * 1000}`);

    const numberMatch = cleanNumbersText.match(/\b\d+(\.\d+)?\b/);
    if (numberMatch) {
      amount = parseFloat(numberMatch[0]);
    } else {
      // Reconnaissance des mots ordinaires
      if (lower.includes('vingt mille') || lower.includes('20 mille')) amount = 20000;
      else if (lower.includes('cinquante mille') || lower.includes('50 mille')) amount = 50000;
      else if (lower.includes('quinze mille') || lower.includes('15 mille')) amount = 15000;
      else if (lower.includes('dix mille') || lower.includes('10 mille')) amount = 10000;
      else if (lower.includes('cinq mille') || lower.includes('5 mille')) amount = 5000;
      else if (lower.includes('deux mille') || lower.includes('2 mille')) amount = 2000;
      else if (lower.includes('trois mille') || lower.includes('3 mille')) amount = 3000;
      else if (lower.includes('mille')) amount = 1000;
    }

    // 3. Détection de la catégorie
    let category: AnyCategory = type === 'income' ? 'salaire' : 'alimentation';

    if (lower.includes('loyer') || lower.includes('maison') || lower.includes('chambre') || lower.includes('so')) {
      category = 'logement';
      isMandatory = true;
    } else if (lower.includes('transport') || lower.includes('taxi') || lower.includes('bus') || lower.includes('carburant') || lower.includes('essence') || lower.includes('moto') || lower.includes('mobili')) {
      category = 'transport';
      isMandatory = true;
    } else if (lower.includes('nourriture') || lower.includes('manger') || lower.includes('repas') || lower.includes('marché') || lower.includes('riz') || lower.includes('pain') || lower.includes('dumuni')) {
      category = 'alimentation';
      isMandatory = true;
    } else if (lower.includes('électricité') || lower.includes('woyofal') || lower.includes('courant') || lower.includes('eau') || lower.includes('compteur') || lower.includes('ji')) {
      category = 'electricite_eau';
      isMandatory = true;
    } else if (lower.includes('internet') || lower.includes('forfait') || lower.includes('data') || lower.includes('téléphone') || lower.includes('wifi') || lower.includes('crédit')) {
      category = 'internet_telecom';
      isMandatory = true;
    } else if (lower.includes('santé') || lower.includes('médicament') || lower.includes('pharmacie') || lower.includes('docteur') || lower.includes('hôpital')) {
      category = 'sante';
      isMandatory = true;
    } else if (lower.includes('dette') || lower.includes('remboursement') || lower.includes('tontine') || lower.includes('prêt')) {
      category = 'dette_remboursement';
      isMandatory = true;
    } else if (lower.includes('vente') || lower.includes('commerce') || lower.includes('boutique') || lower.includes('client')) {
      category = type === 'income' ? 'commerce_ventes' : 'commerce_business';
    } else if (lower.includes('prestation') || lower.includes('freelance') || lower.includes('mission')) {
      category = 'freelance_service';
    } else if (lower.includes('loisir') || lower.includes('fête') || lower.includes('cadeau') || lower.includes('resto') || lower.includes('sortie')) {
      category = 'loisirs_famille';
      isMandatory = false;
    }

    // 4. Extraction de la date
    let dateStr = new Date().toISOString().split('T')[0];
    const today = new Date();

    // Détection d'un jour spécifique du mois (ex: "le 5", "le 28")
    const dayMatch = lower.match(/le\s+(\d{1,2})/);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(dayNum).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
    } else if (lower.includes('hier')) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      dateStr = yesterday.toISOString().split('T')[0];
    } else if (lower.includes('demain')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dateStr = tomorrow.toISOString().split('T')[0];
    }

    // Titre structuré automatique
    let generatedTitle = '';
    if (type === 'income') {
      generatedTitle = `Revenu déclaré (${category.replace('_', ' ')})`;
    } else {
      generatedTitle = `Dépense déclarée (${category.replace('_', ' ')})`;
    }

    return {
      rawTranscript: text,
      type,
      amount: amount > 0 ? amount : 5000,
      title: generatedTitle,
      category,
      date: dateStr,
      isMandatory,
      confidence: amount > 0 ? 0.92 : 0.65,
      languageDetected: targetLanguage,
    };
  }
}
