/**
 * CORE CAPITAL — Service de Stockage Local & Préparation Supabase
 * Gère la persistance locale via LocalStorage et prépare le pont pour Supabase.
 */

import {
  UserProfile,
  Transaction,
  ScheduledExpense,
  SavingsGoal,
  MarketplaceItem,
  SupabaseConfigState,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_TRANSACTIONS,
  DEFAULT_SCHEDULED_EXPENSES,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_MARKETPLACE_ITEMS,
} from '../data/defaultData';

const STORAGE_KEYS = {
  USER_PROFILE: 'core_capital_user_profile_v1',
  TRANSACTIONS: 'core_capital_transactions_v1',
  SCHEDULED_EXPENSES: 'core_capital_scheduled_expenses_v1',
  SAVINGS_GOALS: 'core_capital_savings_goals_v1',
  MARKETPLACE_ITEMS: 'core_capital_marketplace_items_v1',
  SUPABASE_CONFIG: 'core_capital_supabase_config_v1',
};

export const storageService = {
  // Profil
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Transactions
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Échéances programmées
  getScheduledExpenses(): ScheduledExpense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULED_EXPENSES);
      return data ? JSON.parse(data) : DEFAULT_SCHEDULED_EXPENSES;
    } catch {
      return DEFAULT_SCHEDULED_EXPENSES;
    }
  },

  saveScheduledExpenses(expenses: ScheduledExpense[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_EXPENSES, JSON.stringify(expenses));
  },

  // Épargne virtuelle
  getSavingsGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      return data ? JSON.parse(data) : DEFAULT_SAVINGS_GOALS;
    } catch {
      return DEFAULT_SAVINGS_GOALS;
    }
  },

  saveSavingsGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  },

  // Marketplace
  getMarketplaceItems(): MarketplaceItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MARKETPLACE_ITEMS);
      return data ? JSON.parse(data) : DEFAULT_MARKETPLACE_ITEMS;
    } catch {
      return DEFAULT_MARKETPLACE_ITEMS;
    }
  },

  saveMarketplaceItems(items: MarketplaceItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE_ITEMS, JSON.stringify(items));
  },

  // Configuration Supabase
  getSupabaseConfig(): SupabaseConfigState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
      return data
        ? JSON.parse(data)
        : {
            supabaseUrl: '',
            supabaseAnonKey: '',
            tableNameTransactions: 'transactions',
            tableNameGoals: 'savings_goals',
            isSyncReady: false,
          };
    } catch {
      return {
        supabaseUrl: '',
        supabaseAnonKey: '',
        tableNameTransactions: 'transactions',
        tableNameGoals: 'savings_goals',
        isSyncReady: false,
      };
    }
  },

  saveSupabaseConfig(config: SupabaseConfigState): void {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  },

  // Réinitialisation complète
  resetToDefaultData(): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_EXPENSES, JSON.stringify(DEFAULT_SCHEDULED_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE_ITEMS, JSON.stringify(DEFAULT_MARKETPLACE_ITEMS));
  },

  // Export JSON
  exportAllDataAsJson(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userProfile: this.getUserProfile(),
      transactions: this.getTransactions(),
      scheduledExpenses: this.getScheduledExpenses(),
      savingsGoals: this.getSavingsGoals(),
      marketplaceItems: this.getMarketplaceItems(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import JSON
  importDataFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.userProfile) this.saveUserProfile(parsed.userProfile);
      if (parsed.transactions) this.saveTransactions(parsed.transactions);
      if (parsed.scheduledExpenses) this.saveScheduledExpenses(parsed.scheduledExpenses);
      if (parsed.savingsGoals) this.saveSavingsGoals(parsed.savingsGoals);
      if (parsed.marketplaceItems) this.saveMarketplaceItems(parsed.marketplaceItems);
      return true;
    } catch (err) {
      console.error('Erreur lors de l’importation des données:', err);
      return false;
    }
  },

  // Schéma SQL d’intégration Supabase prêt à l'emploi
  getSupabaseSqlSchema(): string {
    return `-- ==========================================
-- SCHEMA CORE CAPITAL V1 POUR SUPABASE (POSTGRESQL)
-- Compatible avec l'authentification Supabase (auth.users)
-- ==========================================

-- Table: Profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  profession TEXT,
  city TEXT DEFAULT 'Dakar',
  country TEXT DEFAULT 'Sénégal',
  currency TEXT DEFAULT 'FCFA',
  monthly_salary NUMERIC(12, 2) DEFAULT 50000.00,
  salary_day_of_month INT DEFAULT 28,
  declared_initial_balance NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Transactions financières déclarées
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_day INT,
  status TEXT CHECK (status IN ('paid', 'pending', 'postponed', 'unpaid')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Échéances calendaires
CREATE TABLE IF NOT EXISTS public.scheduled_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  recurrence_day INT NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'postponed', 'unpaid')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Objectifs d'épargne virtuelle
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0.00,
  deadline DATE NOT NULL,
  notes TEXT,
  is_reached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Marketplace économique
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  required_capital NUMERIC(12, 2) NOT NULL,
  estimated_cycle_days INT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_contact TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'funded', 'closed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (Lecture/Écriture uniquement par le propriétaire)
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own expenses"
  ON public.scheduled_expenses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON public.savings_goals FOR ALL USING (auth.uid() = user_id);
`;
  },
};
