/**
 * CORE CAPITAL V3 — Moteur Déterministe Financier & Décisionnel
 * "Your Money. Your Decisions. Your Future."
 */

import {
  Transaction,
  ScheduledExpense,
  SavingsGoal,
  UserProfile,
  IncomeSource,
  FinancialSummary,
  BudgetRiskAlert,
  DecisionAnalysisRequest,
  DecisionAnalysisResult,
  DecisionVerdict,
} from '../types';

export const CATEGORY_LABELS: Record<string, string> = {
  logement: 'Loyer & Logement',
  electricite_eau: 'Électricité & Eau',
  internet_telecom: 'Internet & Télécom',
  alimentation: 'Alimentation & Marché',
  transport: 'Transport & Déplacements',
  sante: 'Santé & Soins',
  education: 'Éducation & Formation',
  dette_remboursement: 'Dettes & Engagements',
  commerce_business: 'Commerce & Activité',
  loisirs_famille: 'Famille & Loisirs',
  divers: 'Autres Dépenses',
  salaire: 'Salaire & Émoluments',
  commerce_ventes: 'Ventes & Commerce',
  freelance_service: 'Prestations & Services',
  transfert_aide: 'Aides & Tontines',
  activite_secondaire: 'Activité Secondaire',
  dividendes_placements: 'Dividendes & Placements',
  divers_revenu: 'Autres Revenus',
};

export const CATEGORY_BENCHMARKS: Record<string, { maxPercent: number; advice: string }> = {
  logement: {
    maxPercent: 28,
    advice: 'Le loyer ne devrait idéalement pas excéder 28% de votre revenu net déclaré.',
  },
  alimentation: {
    maxPercent: 25,
    advice: 'Optimisez par des achats groupés au marché central au demi-gros.',
  },
  transport: {
    maxPercent: 10,
    advice: 'Le transport régulier devrait rester sous 10% de vos rentrées.',
  },
  electricite_eau: {
    maxPercent: 8,
    advice: 'Maîtrisez l’énergie avec des ampoules LED et gestion prépayée.',
  },
  internet_telecom: {
    maxPercent: 5,
    advice: 'Limitez le forfait data à 5% de votre budget.',
  },
  dette_remboursement: {
    maxPercent: 15,
    advice: 'Le remboursement total de dettes ne devrait pas dépasser 15-20% de vos rentrées.',
  },
};

/**
 * Calcul complet des métriques financières déterministes (CORE MONEY)
 */
export function computeFinancialSummary(
  transactions: Transaction[],
  scheduledExpenses: ScheduledExpense[],
  savingsGoals: SavingsGoal[],
  userProfile: UserProfile,
  incomeSources: IncomeSource[] = []
): FinancialSummary {
  // 1. Revenus déclarés
  let declaredIncome = 0;
  let fixedIncome = 0;
  let irregularIncome = 0;

  if (incomeSources.length > 0) {
    incomeSources.filter((i) => i.isActive).forEach((inc) => {
      declaredIncome += inc.amount;
      if (inc.nature === 'fixed') fixedIncome += inc.amount;
      else irregularIncome += inc.amount;
    });
  } else {
    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    declaredIncome =
      incomeTransactions.length > 0
        ? incomeTransactions.reduce((acc, t) => acc + t.amount, 0)
        : userProfile.monthlySalary;
    fixedIncome = userProfile.monthlySalary;
  }

  // 2. Dépenses et catégorisation obligatoire / facultatif
  let mandatoryExpenses = 0;
  let optionalExpenses = 0;
  let debtsTotal = 0;
  let paidExpenses = 0;
  let pendingExpenses = 0;
  let postponedExpenses = 0;
  let unpaidExpenses = 0;

  scheduledExpenses.forEach((exp) => {
    if (exp.isMandatory) mandatoryExpenses += exp.amount;
    else optionalExpenses += exp.amount;

    if (exp.isDebt) debtsTotal += exp.amount;

    switch (exp.status) {
      case 'paid':
        paidExpenses += exp.amount;
        break;
      case 'pending':
        pendingExpenses += exp.amount;
        break;
      case 'postponed':
        postponedExpenses += exp.amount;
        break;
      case 'unpaid':
        unpaidExpenses += exp.amount;
        break;
    }
  });

  const oneTimeExpenses = transactions
    .filter((t) => t.type === 'expense' && !t.isRecurring)
    .reduce((acc, t) => acc + t.amount, 0);

  const projectedExpenses = mandatoryExpenses + optionalExpenses + oneTimeExpenses;
  const projectedNetBalance = declaredIncome - projectedExpenses;

  // 3. Argent réservé aux obligations et argent disponible déclaré
  const reservedForObligations = mandatoryExpenses + debtsTotal;
  const availableCashDeclared = Math.max(0, userProfile.declaredInitialBalance);

  // 4. Reste à vivre journalier (30 jours)
  const remainingDailyBudget = Math.max(0, Math.round(projectedNetBalance / 30));

  // 5. Ratios
  const rentExpense = scheduledExpenses.find((s) => s.category === 'logement')?.amount || 0;
  const rentBurdenRatio = declaredIncome > 0 ? Math.round((rentExpense / declaredIncome) * 100) : 0;
  const fixedNeedsRatio = declaredIncome > 0 ? Math.round((reservedForObligations / declaredIncome) * 100) : 0;

  const totalSavingsAllocated = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const savingsRate = declaredIncome > 0 ? Math.max(0, Math.round((projectedNetBalance / declaredIncome) * 100)) : 0;

  // 6. Alertes déterministes
  const alerts: BudgetRiskAlert[] = [];

  if (rentBurdenRatio >= 30) {
    alerts.push({
      id: 'alert-rent',
      level: rentBurdenRatio > 40 ? 'critical' : 'warning',
      title: 'Poids élevé du loyer',
      metric: `${rentBurdenRatio}% du revenu`,
      message: `Le loyer absorbe ${rentBurdenRatio}% de votre revenu net déclaré (${rentExpense.toLocaleString('fr-FR')} ${userProfile.currency}).`,
      recommendation: 'Maintenez ce loyer sans contracter de charges supplémentaires liées au mobilier.',
    });
  }

  if (debtsTotal > 0) {
    alerts.push({
      id: 'alert-debts',
      level: 'warning',
      title: 'Dettes & Engagements à honorer',
      metric: `${debtsTotal.toLocaleString('fr-FR')} ${userProfile.currency}`,
      message: `Vous avez déclaré des engagements réguliers de ${debtsTotal.toLocaleString('fr-FR')} ${userProfile.currency} ce mois-ci.`,
      recommendation: 'Priorisez le remboursement de ces engagements pour libérer votre reste à vivre.',
    });
  }

  if (projectedNetBalance <= 10000) {
    alerts.push({
      id: 'alert-cashflow',
      level: projectedNetBalance <= 5000 ? 'critical' : 'warning',
      title: 'Trésorerie sous tension',
      metric: `${remainingDailyBudget.toLocaleString('fr-FR')} ${userProfile.currency} / jour`,
      message: `Reste à vivre disponible : ${projectedNetBalance.toLocaleString('fr-FR')} ${userProfile.currency} après toutes vos charges prévues.`,
      recommendation: 'Reportez tout achat facultatif et alimentez en priorité votre réserve d’urgence.',
    });
  }

  return {
    declaredIncome,
    fixedIncome,
    irregularIncome,
    projectedExpenses,
    mandatoryExpenses,
    optionalExpenses,
    debtsTotal,
    paidExpenses,
    pendingExpenses,
    postponedExpenses,
    unpaidExpenses,
    projectedNetBalance,
    availableCashDeclared,
    reservedForObligations,
    remainingDailyBudget,
    totalSavingsAllocated,
    savingsRate,
    rentBurdenRatio,
    fixedNeedsRatio,
    alerts,
  };
}

/**
 * MODULE 2 : Analyseur Décisionnel "Puis-je me le permettre ?"
 * Vérifie de manière déterministe les conséquences d'un achat avant de décider.
 */
export function analyzePurchaseDecision(req: DecisionAnalysisRequest): DecisionAnalysisResult {
  const {
    availableCash,
    nextIncomeAmount,
    daysUntilNextIncome,
    upcomingMandatoryExpenses,
    upcomingDebts,
    purchaseAmount,
    purchaseTitle,
  } = req;

  // Total obligations incompressibles d'ici le prochain revenu
  const totalUpcomingObligations = upcomingMandatoryExpenses + upcomingDebts;

  // Solde disponible théorique après avoir réservé les obligations
  const discretionaryBufferBeforePurchase = availableCash - totalUpcomingObligations;

  // Solde restant net après l'achat envisagé
  const balanceAfterPurchase = availableCash - purchaseAmount;

  // Marge de sécurité restante après obligations ET achat
  const safetyMarginRemaining = balanceAfterPurchase - totalUpcomingObligations;

  // Calcul du risque de liquidité (0 à 100%)
  let liquidityRiskPercentage = 0;
  if (safetyMarginRemaining < 0) {
    liquidityRiskPercentage = 100;
  } else if (safetyMarginRemaining < totalUpcomingObligations * 0.25) {
    liquidityRiskPercentage = 75;
  } else if (safetyMarginRemaining < totalUpcomingObligations * 0.5) {
    liquidityRiskPercentage = 40;
  } else {
    liquidityRiskPercentage = 10;
  }

  const detailedReasoning: string[] = [];
  let verdict: DecisionVerdict = 'feasible_now';
  let verdictTitle = '';
  let concreteAdvice = '';
  let cheaperAlternativeTarget: number | undefined;

  // Verdict 3 : Choisir une option moins chère ou renoncer
  if (safetyMarginRemaining < 0) {
    verdict = 'cheaper_option';
    verdictTitle = 'Option moins chère ou renoncement conseillé';
    const deficit = Math.abs(safetyMarginRemaining);
    cheaperAlternativeTarget = Math.max(0, Math.round(purchaseAmount - deficit * 1.2));

    detailedReasoning.push(
      `Cet achat de ${purchaseAmount.toLocaleString('fr-FR')} FCFA provoquerait un déficit de trésorerie de -${deficit.toLocaleString('fr-FR')} FCFA avant votre prochain revenu.`
    );
    detailedReasoning.push(
      `Vos obligations incompressibles (${totalUpcomingObligations.toLocaleString('fr-FR')} FCFA comprenant loyer, charges et dettes) ne pourraient pas être honorées à temps.`
    );
    detailedReasoning.push(
      `Il vous reste ${daysUntilNextIncome} jours à tenir avant la rentrée d’argent suivante.`
    );

    concreteAdvice = cheaperAlternativeTarget > 0
      ? `Si cet achat est indispensable, recherchez une alternative à moins de ${cheaperAlternativeTarget.toLocaleString('fr-FR')} FCFA, ou négociez un paiement différé après le versement de votre revenu.`
      : `Renoncez temporairement à cet achat pour éviter tout incident d'impayé sur vos charges vitales.`;
  }
  // Verdict 2 : Achat à reporter
  else if (safetyMarginRemaining < totalUpcomingObligations * 0.35 || balanceAfterPurchase < 5000) {
    verdict = 'postpone';
    verdictTitle = 'Achat à reporter après la prochaine rentrée d’argent';

    detailedReasoning.push(
      `Après cet achat, votre marge de sécurité restante ne serait que de ${safetyMarginRemaining.toLocaleString('fr-FR')} FCFA pour les ${daysUntilNextIncome} prochains jours.`
    );
    detailedReasoning.push(
      `Le moindre imprévu de santé, de transport ou de réparation vous mettrait en situation d’urgence financière.`
    );
    detailedReasoning.push(
      `Votre prochain revenu de ${nextIncomeAmount.toLocaleString('fr-FR')} FCFA est attendu dans ${daysUntilNextIncome} jours.`
    );

    concreteAdvice = `Attendez la réception de votre prochain revenu (${nextIncomeAmount.toLocaleString('fr-FR')} FCFA). Une fois les obligations prioritaires réglées, vous pourrez réaliser cet achat en toute sécurité.`;
  }
  // Verdict 1 : Achat envisageable maintenant
  else {
    verdict = 'feasible_now';
    verdictTitle = 'Achat envisageable maintenant sans compromettre vos obligations';

    detailedReasoning.push(
      `Toutes vos obligations obligatoires (${totalUpcomingObligations.toLocaleString('fr-FR')} FCFA) sont sécurisées.`
    );
    detailedReasoning.push(
      `Il vous restera un coussin de sécurité confortable de ${safetyMarginRemaining.toLocaleString('fr-FR')} FCFA après l'achat pour couvrir les ${daysUntilNextIncome} jours restants.`
    );
    detailedReasoning.push(
      `Votre prochain revenu de ${nextIncomeAmount.toLocaleString('fr-FR')} FCFA viendra reconstituer votre trésorerie.`
    );

    concreteAdvice = `Vous pouvez procéder à cet achat de manière responsable. Veillez simplement à pointer immédiatement vos dépenses dans CORE CAPITAL.`;
  }

  return {
    verdict,
    verdictTitle,
    estimatedRemainingBalance: balanceAfterPurchase,
    safetyMarginRemaining,
    liquidityRiskPercentage,
    remainingObligations: totalUpcomingObligations,
    detailedReasoning,
    concreteAdvice,
    cheaperAlternativeTarget,
  };
}
