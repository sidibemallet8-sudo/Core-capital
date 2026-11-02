-- ==============================================================================
-- CORE CAPITAL V3 — ARCHITECTURE & MIGRATION COMPLÈTE POSTGRESQL / SUPABASE
-- "Your Money. Your Decisions. Your Future."
-- ==============================================================================

-- 1. EXTENSIONS RECOMMANDÉES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROFILS ET PARAMÈTRES UTILISATEUR
-- ==============================================================================

CREATE TYPE user_role_type AS ENUM ('user', 'project_owner', 'moderator', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  profession TEXT DEFAULT '',
  city TEXT DEFAULT 'Dakar',
  country TEXT DEFAULT 'Sénégal',
  currency TEXT DEFAULT 'FCFA' CHECK (currency IN ('FCFA', 'EUR', 'USD')),
  monthly_salary NUMERIC(14, 2) DEFAULT 0.00,
  salary_day_of_month INT DEFAULT 28 CHECK (salary_day_of_month BETWEEN 1 AND 31),
  declared_initial_balance NUMERIC(14, 2) DEFAULT 0.00,
  role user_role_type DEFAULT 'user',
  avatar_url TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  market_alerts_enabled BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. MODULE 1 — CORE MONEY (REVENUS, DÉPENSES, BUDGETS, ÉPARGNE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'weekly', 'one_time', 'variable')),
  nature TEXT NOT NULL DEFAULT 'fixed' CHECK (nature IN ('fixed', 'irregular')),
  reception_day INT DEFAULT 28 CHECK (reception_day BETWEEN 1 AND 31),
  category TEXT NOT NULL DEFAULT 'salaire',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  recurrence_day INT NOT NULL CHECK (recurrence_day BETWEEN 1 AND 31),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'postponed', 'unpaid')),
  is_recurring BOOLEAN DEFAULT TRUE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  is_debt BOOLEAN DEFAULT FALSE,
  creditor_name TEXT,
  remaining_debt_amount NUMERIC(14, 2) DEFAULT 0.00,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'postponed', 'unpaid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- 'YYYY-MM'
  target_savings_rate NUMERIC(5, 2) DEFAULT 20.00,
  allocated_food NUMERIC(14, 2) DEFAULT 0.00,
  allocated_housing NUMERIC(14, 2) DEFAULT 0.00,
  allocated_transport NUMERIC(14, 2) DEFAULT 0.00,
  allocated_bills NUMERIC(14, 2) DEFAULT 0.00,
  allocated_others NUMERIC(14, 2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
  deadline DATE NOT NULL,
  is_reached BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. MODULE 6, 7 & 9 — CORE PROJECTS, IMPACT & TRUST
-- ==============================================================================

CREATE TYPE project_status_type AS ENUM ('draft', 'under_review', 'published', 'rejected', 'suspended');

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  logo_url TEXT,
  tagline TEXT,
  sector TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  proposed_solution TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  business_model TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'demarrage',
  founder_presentation TEXT,
  team_experience TEXT,
  capital_target NUMERIC(14, 2) CHECK (capital_target >= 0),
  currency TEXT DEFAULT 'FCFA',
  funding_use_plan TEXT,
  estimated_duration_months INT DEFAULT 12,
  risks_analysis TEXT,
  status project_status_type DEFAULT 'published',
  views_count INT DEFAULT 0,
  is_verified_identity BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  doc_name TEXT NOT NULL,
  doc_type TEXT NOT NULL, -- 'rccm', 'fra', 'bail', 'contrat', 'bilan'
  file_url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'verified', 'rejected', 'missing')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_metrics (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  jobs_created INT DEFAULT 0,
  monthly_revenue NUMERIC(14, 2) DEFAULT 0.00,
  gross_margin_percent NUMERIC(5, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('unfavorable', 'intermediate', 'favorable')),
  year INT NOT NULL CHECK (year IN (1, 3, 5)),
  projected_revenue NUMERIC(14, 2) NOT NULL,
  projected_net_margin NUMERIC(14, 2) NOT NULL,
  assumptions TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. MODULE 8 — CORE CONNECT (MESSAGERIE RÉELLE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_title TEXT,
  contact_name TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  last_message TEXT DEFAULT '',
  last_message_time TIMESTAMPTZ DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'project_owner', 'system')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. MODULE 5 — CORE BOURSE & MARCHÉS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.market_assets (
  id TEXT PRIMARY KEY, -- 'SNTS', 'ETI', 'BTC', 'AAPL'
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('brvm', 'actions', 'crypto', 'forex_matieres')),
  currency TEXT NOT NULL,
  last_price NUMERIC(16, 4) NOT NULL,
  change_24h NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  volatility TEXT DEFAULT 'Modérée',
  risk_score TEXT DEFAULT 'Modéré',
  historical_trend TEXT DEFAULT 'Haussière',
  exchange_or_source TEXT NOT NULL,
  description TEXT,
  external_platform_url TEXT,
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_watchlists (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES public.market_assets(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, asset_id)
);

CREATE TABLE IF NOT EXISTS public.market_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES public.market_assets(id) ON DELETE CASCADE,
  asset_symbol TEXT NOT NULL,
  target_price NUMERIC(16, 4) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  is_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL REFERENCES public.market_assets(id) ON DELETE CASCADE,
  price_close NUMERIC(16, 4) NOT NULL,
  price_open NUMERIC(16, 4),
  price_high NUMERIC(16, 4),
  price_low NUMERIC(16, 4),
  volume NUMERIC(16, 2),
  recorded_at TIMESTAMPTZ NOT NULL,
  UNIQUE(asset_id, recorded_at)
);

-- ==============================================================================
-- 7. NOTIFICATIONS, RAPPORTS & AUDIT (MODULE 10 & 11)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_tab TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL, -- 'project', 'message', 'user'
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  admin_name TEXT NOT NULL DEFAULT 'System',
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. SÉCURITÉ ROW LEVEL SECURITY (RLS) & POLITIQUES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques Profils & Paramètres
CREATE POLICY "Users can view and edit their own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own settings"
  ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Politiques Financières (CORE MONEY) : Strictement privées
CREATE POLICY "Users can manage their own income sources"
  ON public.income_sources FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own expenses"
  ON public.expenses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own savings goals"
  ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets"
  ON public.budgets FOR ALL USING (auth.uid() = user_id);

-- Politiques Projets (CORE PROJECTS)
CREATE POLICY "Public read for published projects"
  ON public.projects FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);

CREATE POLICY "Creators can insert their projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own projects"
  ON public.projects FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own projects"
  ON public.projects FOR DELETE USING (auth.uid() = creator_id);

-- Politiques Messagerie (CORE CONNECT)
CREATE POLICY "Members can view their conversations"
  ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = conversations.id AND user_id = auth.uid())
  );

CREATE POLICY "Members can view and send messages"
  ON public.messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
  );

-- Politiques Notifications & Alertes
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their market alerts"
  ON public.market_alerts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their watchlists"
  ON public.market_watchlists FOR ALL USING (auth.uid() = user_id);

-- Politiques Administration & Audit : Admins uniquement
CREATE POLICY "Admins can view and manage all audit logs"
  ON public.audit_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );
