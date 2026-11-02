/**
 * CORE CAPITAL V3 — Types & Contrats Fintech
 * "Your Money. Your Decisions. Your Future."
 */

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'logement'
  | 'electricite_eau'
  | 'internet_telecom'
  | 'alimentation'
  | 'transport'
  | 'sante'
  | 'education'
  | 'dette_remboursement'
  | 'commerce_business'
  | 'loisirs_famille'
  | 'divers';

export type IncomeCategory =
  | 'salaire'
  | 'commerce_ventes'
  | 'freelance_service'
  | 'transfert_aide'
  | 'activite_secondaire'
  | 'dividendes_placements'
  | 'divers_revenu';

export type AnyCategory = ExpenseCategory | IncomeCategory;

export type ExpenseStatus = 'paid' | 'pending' | 'postponed' | 'unpaid';

export type IncomeFrequency = 'monthly' | 'weekly' | 'one_time' | 'variable';
export type IncomeNature = 'fixed' | 'irregular';

export interface IncomeSource {
  id: string;
  title: string;
  amount: number;
  frequency: IncomeFrequency;
  nature: IncomeNature;
  receptionDay?: number; // 1-31
  category: IncomeCategory;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduledExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  dueDate: string; // YYYY-MM-DD
  recurrenceDay: number; // Day of month 1-31
  status: ExpenseStatus; // paid | pending | postponed | unpaid
  isRecurring: boolean;
  isMandatory: boolean; // Obligatoire vs Facultative
  isDebt?: boolean; // Dette ou engagement
  creditorName?: string;
  remainingDebtAmount?: number;
  notes?: string;
  paidAt?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: AnyCategory;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  isMandatory?: boolean;
  status: ExpenseStatus;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface SavingsHistoryEntry {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: 'urgence' | 'equipement' | 'commerce' | 'famille' | 'projet' | 'etudes';
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  notes?: string;
  isReached: boolean;
  history: SavingsHistoryEntry[];
  createdAt: string;
}

// ================= MODULE 2 : CORE DECISION =================
export type DecisionVerdict = 'feasible_now' | 'postpone' | 'cheaper_option';

export interface DecisionAnalysisRequest {
  availableCash: number;
  nextIncomeAmount: number;
  daysUntilNextIncome: number;
  upcomingMandatoryExpenses: number;
  upcomingDebts: number;
  purchaseAmount: number;
  purchaseTitle: string;
}

export interface DecisionAnalysisResult {
  verdict: DecisionVerdict;
  verdictTitle: string;
  estimatedRemainingBalance: number;
  safetyMarginRemaining: number;
  liquidityRiskPercentage: number;
  remainingObligations: number;
  detailedReasoning: string[];
  concreteAdvice: string;
  cheaperAlternativeTarget?: number;
}

// ================= MODULE 3 : CORE VOICE =================
export interface VoiceParsedProposal {
  rawTranscript: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: AnyCategory;
  date: string;
  isMandatory?: boolean;
  confidence: number;
  languageDetected: 'fr' | 'bm' | 'en';
}

// ================= MODULE 5 : CORE BOURSE =================
export type MarketCategory = 'actions' | 'brvm' | 'crypto' | 'commodities_fx';

export interface CandleStickPoint {
  time: string; // label (e.g. 09h, J-3, Sem 1)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  currency: string;
  change24h: number; // percentage (e.g. +2.45 or -1.2)
  change7d?: number;
  marketCap?: number;
  volume24h?: number;
  volatility: 'Faible' | 'Modérée' | 'Élevée';
  riskScore: 'Prudent' | 'Modéré' | 'Spéculatif';
  historicalTrend: 'Haussière' | 'Neutre' | 'Baissière';
  exchangeOrSource: string; // e.g. "BRVM Abidjan", "Nasdaq", "CoinGecko / On-Chain", "Marché International"
  description: string;
  authorizedBrokers?: string[];
  externalPlatformUrl: string;
  sparkline: number[];
  candles: CandleStickPoint[];
  dataSourceNotice: string;
  isFavorite?: boolean;
}

export interface MarketAlert {
  id: string;
  assetId: string;
  assetSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  isTriggered: boolean;
}

export interface DiscoveryPreference {
  budget: number;
  timeHorizon: 'court' | 'moyen' | 'long';
  riskTolerance: 'faible' | 'moyen' | 'eleve';
  preferredMarkets: MarketCategory[];
}

// ================= MODULE 6 & 7 : CORE PROJECTS & IMPACT =================
export type ProjectSector =
  | 'agriculture'
  | 'elevage'
  | 'technologie'
  | 'education'
  | 'sante'
  | 'energie'
  | 'transport'
  | 'immobilier'
  | 'commerce'
  | 'industrie'
  | 'services'
  | 'autre';

export type ProjectStage = 'idee' | 'prototype' | 'commercialisation' | 'croissance';

export interface ProjectPublicContact {
  name: string;
  role: 'Fondateur' | 'Directeur' | 'Commercial' | 'Technique' | 'Partenariats';
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface ProjectScenarioImpact {
  year: 1 | 3 | 5;
  unfavorable: { revenue: number; jobs: number; outputMetric: string; outputValue: number };
  intermediate: { revenue: number; jobs: number; outputMetric: string; outputValue: number };
  favorable: { revenue: number; jobs: number; outputMetric: string; outputValue: number };
}

export interface AfricanBenchmarkComparison {
  issueTitle: string; // e.g. "Insécurité alimentaire en Afrique de l'Ouest"
  source: string; // e.g. "Banque Mondiale / FAO (2024)"
  keyStat: string; // e.g. "34% des ménages ruraux affectés"
  projectContribution: string; // e.g. "Réduit les pertes post-récoltes locales de 25%"
}

export interface ProjectTrustInfo {
  isIdentityVerified: boolean;
  verificationLevel: 'Déclaratif' | 'Documents Reçus' | 'Documents Examinés';
  documentsReceived: string[];
  documentsMissing: string[];
  auditHistory: { date: string; action: string }[];
  identifiedRisks: string[];
  reportsCount: number;
}

export interface ProjectSheet {
  id: string;
  title: string;
  logoUrl?: string;
  city: string;
  country: string;
  sector: ProjectSector;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  targetAudience: string;
  businessModel: string;
  stage: ProjectStage;
  teamExperience: string;
  capitalTarget?: number;
  fundingUsePlan?: string;
  estimatedDurationMonths?: number;
  publicContacts: ProjectPublicContact[];
  documentsList: string[];
  trust: ProjectTrustInfo;
  scenarios: ProjectScenarioImpact[];
  africanComparison: AfricanBenchmarkComparison;
  createdAt: string;
  isBookmarked?: boolean;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  requiredCapital: number;
  estimatedCycleDays?: number;
  city: string;
  country: string;
  description: string;
  authorName: string;
  authorContact: string;
  status: 'active' | 'funded' | 'closed';
  createdAt: string;
}

// ================= MODULE 8 : CORE CONNECT (MESSAGERIE) =================
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'project_owner';
  senderName: string;
  text: string;
  timestamp: string;
  attachmentName?: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  projectTitle: string;
  contactName: string;
  contactRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isBlocked?: boolean;
}

// ================= MODULE 10 : NOTIFICATIONS =================
export type NotificationType =
  | 'due_date'
  | 'income_expected'
  | 'market_alert'
  | 'message_received'
  | 'goal_milestone'
  | 'project_update';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
}

// ================= MODULE 11 : ADMINISTRATION & AUDIT =================
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  adminName: string;
  details: string;
}

// ================= USER & SYSTEM SUMMARY =================
export interface UserProfile {
  fullName: string;
  profession: string;
  city: string;
  country: string;
  currency: 'FCFA' | 'EUR' | 'USD';
  monthlySalary: number;
  salaryDayOfMonth: number;
  declaredInitialBalance: number;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  lastUpdated: string;
  isAdmin?: boolean;
  isIdentityVerified?: boolean;
  role?: 'user' | 'project_owner' | 'moderator' | 'admin';
}

export interface BudgetRiskAlert {
  id: string;
  level: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  message: string;
  metric: string;
  recommendation: string;
}

export interface FinancialSummary {
  declaredIncome: number;
  fixedIncome: number;
  irregularIncome: number;
  projectedExpenses: number;
  mandatoryExpenses: number; // Dépenses obligatoires
  optionalExpenses: number; // Dépenses facultatives
  debtsTotal: number; // Total dettes et engagements
  paidExpenses: number;
  pendingExpenses: number;
  postponedExpenses: number;
  unpaidExpenses: number;
  projectedNetBalance: number;
  availableCashDeclared: number; // Argent disponible déclaré
  reservedForObligations: number; // Argent réservé aux obligations
  remainingDailyBudget: number; // Reste à vivre journalier
  totalSavingsAllocated: number;
  savingsRate: number;
  rentBurdenRatio: number;
  fixedNeedsRatio: number;
  alerts: BudgetRiskAlert[];
}

export interface SupabaseConfigState {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tableNameTransactions: string;
  tableNameGoals: string;
  isSyncReady: boolean;
  lastSyncAttempt?: string;
}
