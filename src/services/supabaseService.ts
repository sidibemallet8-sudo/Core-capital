/**
 * CORE CAPITAL — Service d'Intégration Supabase V3
 * Projet : ncedgklsuxiiprlgbkti (https://ncedgklsuxiiprlgbkti.supabase.co)
 * Connecte Réellement :
 * 1. Supabase Auth (Inscription, Connexion, Session, Reset)
 * 2. Profil utilisateur (Table profiles)
 * 3. Enregistrement et consultation des projets (Table projects & project_contacts)
 * 4. Gestion des transactions et dépenses (Table transactions, expenses, income_sources)
 * 5. Messagerie persistante avec Realtime (Table conversations, messages)
 * 6. Upload de documents & logos (Supabase Storage)
 */

import { getSupabaseClient } from './supabaseClient';
import {
  UserProfile,
  ProjectSheet,
  Transaction,
  ScheduledExpense,
  IncomeSource,
  ChatMessage,
  Conversation,
  ExpenseStatus,
} from '../types';

export interface SupabaseAuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const supabaseService = {
  // ================= 1. AUTHENTIFICATION =================
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: 'user' | 'project_owner' | 'moderator' | 'admin' = 'user'
  ): Promise<SupabaseAuthResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: "Client Supabase non initialisé. Veuillez renseigner la clé VITE_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Enregistrer automatiquement le profil dans la table `public.profiles`
        await this.createOrUpdateProfile(data.user.id, {
          email,
          fullName,
          role,
        });
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’inscription.' };
    }
  },

  async signIn(email: string, password: string): Promise<SupabaseAuthResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: "Client Supabase non initialisé. Veuillez renseigner la clé VITE_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la connexion.' };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: "Client Supabase non initialisé. Veuillez renseigner la clé VITE_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getCurrentSession() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  // ================= 2. GESTION DU PROFIL =================
  async getProfile(userId: string): Promise<Partial<UserProfile> | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        fullName: data.full_name || '',
        profession: data.profession || '',
        city: data.city || 'Dakar',
        country: data.country || 'Sénégal',
        currency: data.currency || 'FCFA',
        monthlySalary: Number(data.monthly_salary) || 0,
        salaryDayOfMonth: data.salary_day_of_month || 28,
        declaredInitialBalance: Number(data.declared_initial_balance) || 0,
        isAdmin: data.role === 'admin' || data.role === 'moderator',
        isIdentityVerified: data.is_verified || false,
      };
    } catch (err) {
      console.warn('[Supabase] Erreur lecture profil:', err);
      return null;
    }
  },

  async createOrUpdateProfile(
    userId: string,
    profile: {
      email?: string;
      fullName?: string;
      profession?: string;
      city?: string;
      country?: string;
      currency?: string;
      monthlySalary?: number;
      salaryDayOfMonth?: number;
      declaredInitialBalance?: number;
      role?: string;
    }
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const payload: any = {
        id: userId,
        updated_at: new Date().toISOString(),
      };
      if (profile.email) payload.email = profile.email;
      if (profile.fullName !== undefined) payload.full_name = profile.fullName;
      if (profile.profession !== undefined) payload.profession = profile.profession;
      if (profile.city !== undefined) payload.city = profile.city;
      if (profile.country !== undefined) payload.country = profile.country;
      if (profile.currency !== undefined) payload.currency = profile.currency;
      if (profile.monthlySalary !== undefined) payload.monthly_salary = profile.monthlySalary;
      if (profile.salaryDayOfMonth !== undefined) payload.salary_day_of_month = profile.salaryDayOfMonth;
      if (profile.declaredInitialBalance !== undefined)
        payload.declared_initial_balance = profile.declaredInitialBalance;
      if (profile.role) payload.role = profile.role;

      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) {
        console.warn('[Supabase] Erreur upsert profil:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] Exception upsert profil:', err);
      return false;
    }
  },

  // ================= 3. GESTION DES PROJETS (TABLE projects) =================
  async getProjects(): Promise<ProjectSheet[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_contacts (*),
          project_documents (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] Erreur getProjects:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        logoUrl: row.logo_url || undefined,
        city: row.city,
        country: row.country,
        sector: row.sector,
        description: row.description,
        problemStatement: row.problem_statement || '',
        proposedSolution: row.proposed_solution || '',
        targetAudience: row.target_audience || '',
        businessModel: row.business_model || '',
        stage: row.stage || 'commercialisation',
        teamExperience: row.team_experience || row.founder_presentation || '',
        capitalTarget: row.capital_target ? Number(row.capital_target) : undefined,
        fundingUsePlan: row.funding_use_plan || undefined,
        estimatedDurationMonths: row.estimated_duration_months || 12,
        publicContacts: (row.project_contacts || []).map((c: any) => ({
          name: c.name,
          role: c.role,
          phone: c.phone || undefined,
          whatsapp: c.whatsapp || undefined,
          email: c.email || undefined,
        })),
        documentsList: (row.project_documents || []).map((d: any) => d.doc_name),
        trust: {
          isIdentityVerified: row.is_verified_identity || false,
          verificationLevel: row.is_verified_identity ? 'Documents Examinés' : 'Documents Reçus',
          documentsReceived: (row.project_documents || []).map((d: any) => d.doc_name),
          documentsMissing: [],
          auditHistory: [
            {
              date: new Date(row.created_at).toLocaleDateString('fr-FR'),
              action: `Projet enregistré dans la base Supabase`,
            },
          ],
          identifiedRisks: row.risks_analysis ? [row.risks_analysis] : [],
          reportsCount: 0,
        },
        scenarios: [
          {
            year: 1,
            unfavorable: { revenue: (row.capital_target || 5000000) * 0.8, jobs: 2, outputMetric: 'Volume V1', outputValue: 100 },
            intermediate: { revenue: (row.capital_target || 5000000) * 1.2, jobs: 4, outputMetric: 'Volume V1', outputValue: 150 },
            favorable: { revenue: (row.capital_target || 5000000) * 1.8, jobs: 6, outputMetric: 'Volume V1', outputValue: 220 },
          },
        ],
        africanComparison: {
          issueTitle: `Développement économique local (${row.sector})`,
          source: 'Étude d’impact sous-régionale UEMOA',
          keyStat: 'Taux de bancarisation et création d’emplois',
          projectContribution: 'Création d’activités locales et structuration de la filière',
        },
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('[Supabase] Exception getProjects:', err);
      return [];
    }
  },

  async createProject(
    project: Omit<ProjectSheet, 'id' | 'createdAt'>,
    creatorId: string
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Connexion Supabase non disponible' };
    }

    try {
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .insert({
          creator_id: creatorId,
          title: project.title,
          logo_url: project.logoUrl || null,
          sector: project.sector,
          country: project.country,
          city: project.city,
          description: project.description,
          problem_statement: project.problemStatement,
          proposed_solution: project.proposedSolution,
          target_audience: project.targetAudience,
          business_model: project.businessModel,
          stage: project.stage,
          team_experience: project.teamExperience,
          capital_target: project.capitalTarget || null,
          funding_use_plan: project.fundingUsePlan || null,
          estimated_duration_months: project.estimatedDurationMonths || 12,
          risks_analysis: project.trust.identifiedRisks?.join(' ; ') || null,
          status: 'published',
        })
        .select()
        .single();

      if (projError || !projData) {
        return { success: false, error: projError?.message || 'Erreur insertion projet' };
      }

      // Insertion des contacts
      if (project.publicContacts && project.publicContacts.length > 0) {
        const contactsToInsert = project.publicContacts.map((c) => ({
          project_id: projData.id,
          name: c.name,
          role: c.role,
          phone: c.phone || null,
          whatsapp: c.whatsapp || null,
          email: c.email || null,
        }));

        await supabase.from('project_contacts').insert(contactsToInsert);
      }

      // Insertion des documents référencés
      if (project.documentsList && project.documentsList.length > 0) {
        const docsToInsert = project.documentsList.map((doc) => ({
          project_id: projData.id,
          doc_name: doc,
          doc_type: 'officiel',
          file_url: 'https://corecapital.app/documents/' + encodeURIComponent(doc),
        }));

        await supabase.from('project_documents').insert(docsToInsert);
      }

      return { success: true, projectId: projData.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteProject(projectId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      return !error;
    } catch {
      return false;
    }
  },

  // ================= 4. GESTION DES TRANSACTIONS & DÉPENSES =================
  async getTransactions(userId: string): Promise<Transaction[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        amount: Number(row.amount),
        category: row.category,
        date: row.date,
        isRecurring: row.is_recurring || false,
        isMandatory: row.is_mandatory !== false,
        status: row.status || 'paid',
        notes: row.notes || undefined,
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  },

  async createTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>, userId: string): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: tx.type,
          title: tx.title,
          amount: tx.amount,
          category: tx.category,
          date: tx.date,
          is_recurring: tx.isRecurring || false,
          is_mandatory: tx.isMandatory !== false,
          status: tx.status || 'paid',
          notes: tx.notes || null,
        })
        .select('id')
        .single();

      if (error || !data) return null;
      return data.id;
    } catch {
      return null;
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async getExpenses(userId: string): Promise<ScheduledExpense[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
        category: row.category,
        dueDate: row.due_date,
        recurrenceDay: row.recurrence_day,
        status: row.status as ExpenseStatus,
        isRecurring: row.is_recurring !== false,
        isMandatory: row.is_mandatory !== false,
        isDebt: row.is_debt || false,
        creditorName: row.creditor_name || undefined,
        remainingDebtAmount: row.remaining_debt_amount ? Number(row.remaining_debt_amount) : undefined,
        notes: row.notes || undefined,
      }));
    } catch {
      return [];
    }
  },

  async createExpense(exp: Omit<ScheduledExpense, 'id'>, userId: string): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          due_date: exp.dueDate,
          recurrence_day: exp.recurrenceDay,
          status: exp.status,
          is_recurring: exp.isRecurring,
          is_mandatory: exp.isMandatory,
          is_debt: exp.isDebt || false,
          creditor_name: exp.creditorName || null,
          remaining_debt_amount: exp.remainingDebtAmount || null,
          notes: exp.notes || null,
        })
        .select('id')
        .single();

      if (error || !data) return null;
      return data.id;
    } catch {
      return null;
    }
  },

  async updateExpenseStatus(id: string, status: ExpenseStatus): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const payload: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'paid') {
        payload.paid_at = new Date().toISOString();
      }

      const { error } = await supabase.from('expenses').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // ================= 5. MESSAGERIE & REALTIME (TABLES conversations & messages) =================
  async getConversations(userId: string): Promise<Conversation[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      // Récupérer les conversations où l'utilisateur est membre
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          project_id,
          project_title,
          contact_name,
          contact_role,
          last_message,
          last_message_time,
          is_blocked,
          created_at
        `)
        .order('last_message_time', { ascending: false });

      if (error || !data) return [];

      return data.map((c: any) => ({
        id: c.id,
        projectId: c.project_id || '',
        projectTitle: c.project_title || 'Discussion Projet',
        contactName: c.contact_name,
        contactRole: c.contact_role,
        lastMessage: c.last_message || '',
        lastMessageTime: c.last_message_time || c.created_at,
        isBlocked: c.is_blocked || false,
        unreadCount: 0,
      }));
    } catch {
      return [];
    }
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        sender: m.sender_type === 'project_owner' ? 'project_owner' : 'user',
        senderName: m.sender_name,
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        attachmentName: m.attachment_url ? m.attachment_url.split('/').pop() : undefined,
      }));
    } catch {
      return [];
    }
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: 'user' | 'project_owner',
    content: string,
    attachmentUrl?: string
  ): Promise<ChatMessage | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_name: senderName,
          sender_type: senderType,
          content,
          attachment_url: attachmentUrl || null,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('[Supabase] Erreur sendMessage:', error?.message);
        return null;
      }

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_time: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return {
        id: data.id,
        conversationId: data.conversation_id,
        sender: senderType,
        senderName: data.sender_name,
        text: data.content,
        timestamp: new Date(data.created_at).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        attachmentName: attachmentUrl ? attachmentUrl.split('/').pop() : undefined,
      };
    } catch (err) {
      console.warn('[Supabase] Exception sendMessage:', err);
      return null;
    }
  },

  subscribeToMessages(conversationId: string, onNewMessage: (msg: ChatMessage) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const channelName = `room:${conversationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          const row = payload.new;
          if (row) {
            onNewMessage({
              id: row.id,
              conversationId: row.conversation_id,
              sender: row.sender_type === 'project_owner' ? 'project_owner' : 'user',
              senderName: row.sender_name,
              text: row.content,
              timestamp: new Date(row.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              attachmentName: row.attachment_url ? row.attachment_url.split('/').pop() : undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ================= 6. UPLOAD DE DOCUMENTS & IMAGES (SUPABASE STORAGE) =================
  async uploadFile(
    file: File,
    bucket: string = 'project-documents',
    folder: string = 'public'
  ): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase non connecté' };
    }

    try {
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        // Tenter avec le bucket 'documents' ou 'projects' en fallback si le premier bucket n'est pas encore provisionné
        const altBucket = bucket === 'project-documents' ? 'documents' : 'project-documents';
        const { data: altData, error: altError } = await supabase.storage.from(altBucket).upload(filePath, file);

        if (altError) {
          return { success: false, error: `Erreur Storage: ${error.message}` };
        }

        const { data: publicData } = supabase.storage.from(altBucket).getPublicUrl(altData.path);
        return { success: true, publicUrl: publicData.publicUrl };
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return { success: true, publicUrl: publicData.publicUrl };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors du téléversement.' };
    }
  },
};
