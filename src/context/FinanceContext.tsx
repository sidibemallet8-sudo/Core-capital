/**
 * CORE CAPITAL V3 — Contexte Financier & Écosystème Global
 * "Your Money. Your Decisions. Your Future."
 * Connecte Réellement :
 * - Supabase PostgreSQL & Auth (Projet ncedgklsuxiiprlgbkti)
 * - IndexedDB (Mode Hors-ligne & Cache Local haute performance)
 * - Realtime Messaging
 * - Moteur financier déterministe
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  IncomeSource,
  ScheduledExpense,
  Transaction,
  SavingsGoal,
  MarketAsset,
  MarketAlert,
  ProjectSheet,
  Conversation,
  ChatMessage,
  AppNotification,
  AuditLogEntry,
  FinancialSummary,
  ExpenseStatus,
  DecisionAnalysisRequest,
  DecisionAnalysisResult,
  SupabaseConfigState,
} from '../types';
import { indexedDBService, STORES } from '../services/indexedDBService';
import { storageService } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConnected } from '../services/supabaseClient';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_SCHEDULED_EXPENSES,
  DEFAULT_TRANSACTIONS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_MARKET_ASSETS,
  DEFAULT_PROJECTS,
  DEFAULT_CONVERSATIONS,
  DEFAULT_MESSAGES,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_AUDIT_LOGS,
} from '../data/defaultData';
import { computeFinancialSummary, analyzePurchaseDecision } from '../services/financialEngine';

export type NavTab =
  | 'dashboard'
  | 'money'
  | 'decision'
  | 'voice'
  | 'goals'
  | 'bourse'
  | 'projects'
  | 'messages'
  | 'notifications'
  | 'admin'
  | 'settings';

interface FinanceContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOfflineReady: boolean;
  isSupabaseOnline: boolean;
  supabaseUserId: string | null;

  // Profil
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Module 1 : CORE MONEY
  incomeSources: IncomeSource[];
  addIncomeSource: (source: Omit<IncomeSource, 'id' | 'createdAt'>) => void;
  deleteIncomeSource: (id: string) => void;

  scheduledExpenses: ScheduledExpense[];
  addScheduledExpense: (expense: Omit<ScheduledExpense, 'id'>) => void;
  updateScheduledExpenseStatus: (id: string, status: ExpenseStatus) => void;
  deleteScheduledExpense: (id: string) => void;

  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  financialSummary: FinancialSummary;

  // Module 2 : CORE DECISION
  runDecisionAnalysis: (req: DecisionAnalysisRequest) => DecisionAnalysisResult;

  // Module 4 : CORE GOALS
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'isReached' | 'history' | 'createdAt'>) => void;
  depositToSavingsGoal: (id: string, amount: number, note?: string) => void;
  withdrawFromSavingsGoal: (id: string, amount: number, note?: string) => void;
  deleteSavingsGoal: (id: string) => void;

  // Module 5 : CORE BOURSE
  marketAssets: MarketAsset[];
  toggleWatchlist: (assetId: string) => void;
  marketAlerts: MarketAlert[];
  addMarketAlert: (alert: Omit<MarketAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  deleteMarketAlert: (id: string) => void;

  // Module 6 & 7 : CORE PROJECTS
  projects: ProjectSheet[];
  addProject: (proj: Omit<ProjectSheet, 'id' | 'createdAt'>) => Promise<boolean>;
  toggleProjectBookmark: (id: string) => void;
  selectedProjectForDetail: ProjectSheet | null;
  setSelectedProjectForDetail: (proj: ProjectSheet | null) => void;

  // Module 8 : CORE CONNECT (Messagerie)
  conversations: Conversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, attachmentUrl?: string) => Promise<void>;
  startOrOpenConversation: (projectId: string, contactName: string, contactRole: string, projectTitle: string) => void;

  // Module 10 : NOTIFICATIONS
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;

  // Module 11 : ADMINISTRATION
  auditLogs: AuditLogEntry[];
  deleteProjectByAdmin: (projectId: string) => void;

  // Maintenance & Données
  resetAllToDefault: () => Promise<void>;
  supabaseConfig: SupabaseConfigState;
  updateSupabaseConfig: (cfg: Partial<SupabaseConfigState>) => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(true);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(isSupabaseConnected());
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  // États principaux
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(DEFAULT_INCOME_SOURCES);
  const [scheduledExpenses, setScheduledExpenses] = useState<ScheduledExpense[]>(DEFAULT_SCHEDULED_EXPENSES);
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(DEFAULT_SAVINGS_GOALS);
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>(DEFAULT_MARKET_ASSETS);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [projects, setProjects] = useState<ProjectSheet[]>(DEFAULT_PROJECTS);
  const [conversations, setConversations] = useState<Conversation[]>(DEFAULT_CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEFAULT_AUDIT_LOGS);

  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ProjectSheet | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fonction de chargement depuis Supabase
  const syncFromSupabase = useCallback(async (userId: string) => {
    try {
      // 1. Profil
      const remoteProfile = await supabaseService.getProfile(userId);
      if (remoteProfile) {
        setUserProfile((prev) => ({ ...prev, ...remoteProfile }));
      }

      // 2. Projets enregistrés en base
      const remoteProjects = await supabaseService.getProjects();
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(remoteProjects);
        indexedDBService.bulkPut(STORES.PROJECTS, remoteProjects);
      }

      // 3. Transactions réelles
      const remoteTx = await supabaseService.getTransactions(userId);
      if (remoteTx && remoteTx.length > 0) {
        setTransactions(remoteTx);
        indexedDBService.bulkPut(STORES.TRANSACTIONS, remoteTx);
      }

      // 4. Dépenses réelles
      const remoteExp = await supabaseService.getExpenses(userId);
      if (remoteExp && remoteExp.length > 0) {
        setScheduledExpenses(remoteExp);
        indexedDBService.bulkPut(STORES.SCHEDULED_EXPENSES, remoteExp);
      }

      // 5. Conversations
      const remoteConvs = await supabaseService.getConversations(userId);
      if (remoteConvs && remoteConvs.length > 0) {
        setConversations(remoteConvs);
        indexedDBService.bulkPut(STORES.CONVERSATIONS, remoteConvs);
      }
    } catch (err) {
      console.warn('[FinanceContext] Erreur sync Supabase:', err);
    }
  }, []);

  // Initialisation asynchrone depuis IndexedDB au premier chargement
  useEffect(() => {
    async function loadInitialData() {
      try {
        const loadedProfile = await indexedDBService.getAll<UserProfile>(STORES.USER_PROFILE, [DEFAULT_USER_PROFILE]);
        if (loadedProfile.length > 0) setUserProfile(loadedProfile[0]);

        const loadedIncomes = await indexedDBService.getAll<IncomeSource>(STORES.INCOME_SOURCES, DEFAULT_INCOME_SOURCES);
        setIncomeSources(loadedIncomes);

        const loadedExpenses = await indexedDBService.getAll<ScheduledExpense>(STORES.SCHEDULED_EXPENSES, DEFAULT_SCHEDULED_EXPENSES);
        setScheduledExpenses(loadedExpenses);

        const loadedTx = await indexedDBService.getAll<Transaction>(STORES.TRANSACTIONS, DEFAULT_TRANSACTIONS);
        setTransactions(loadedTx);

        const loadedGoals = await indexedDBService.getAll<SavingsGoal>(STORES.SAVINGS_GOALS, DEFAULT_SAVINGS_GOALS);
        setSavingsGoals(loadedGoals);

        const loadedAssets = await indexedDBService.getAll<MarketAsset>(STORES.MARKET_ASSETS, DEFAULT_MARKET_ASSETS);
        setMarketAssets(loadedAssets);

        const loadedAlerts = await indexedDBService.getAll<MarketAlert>(STORES.MARKET_ALERTS, []);
        setMarketAlerts(loadedAlerts);

        const loadedProjects = await indexedDBService.getAll<ProjectSheet>(STORES.PROJECTS, DEFAULT_PROJECTS);
        setProjects(loadedProjects);

        const loadedConvs = await indexedDBService.getAll<Conversation>(STORES.CONVERSATIONS, DEFAULT_CONVERSATIONS);
        setConversations(loadedConvs);

        const loadedMessages = await indexedDBService.getAll<ChatMessage>(STORES.MESSAGES, DEFAULT_MESSAGES);
        setMessages(loadedMessages);

        const loadedNotifs = await indexedDBService.getAll<AppNotification>(STORES.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
        setNotifications(loadedNotifs);

        const loadedLogs = await indexedDBService.getAll<AuditLogEntry>(STORES.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
        setAuditLogs(loadedLogs);

        setIsOfflineReady(true);

        // Vérification session Supabase
        const session = await supabaseService.getCurrentSession();
        if (session && session.user) {
          setSupabaseUserId(session.user.id);
          setIsSupabaseOnline(true);
          await syncFromSupabase(session.user.id);
        } else {
          setIsSupabaseOnline(isSupabaseConnected());
        }
      } catch (err) {
        console.warn('Erreur chargement local:', err);
      }
    }
    loadInitialData();

    // Écouteur de changement d'état d'authentification Supabase
    const authSub = supabaseService.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setSupabaseUserId(session.user.id);
        setIsSupabaseOnline(true);
        syncFromSupabase(session.user.id);
      } else {
        setSupabaseUserId(null);
        setIsSupabaseOnline(isSupabaseConnected());
      }
    });

    return () => {
      if (authSub && typeof (authSub as any).unsubscribe === 'function') {
        (authSub as any).unsubscribe();
      }
    };
  }, [syncFromSupabase]);

  // Synchronisation Realtime des messages quand une conversation est active
  useEffect(() => {
    if (!activeConversationId) return;

    // Charger les messages distants si connectés
    if (isSupabaseOnline) {
      supabaseService.getMessages(activeConversationId).then((remoteMsgs) => {
        if (remoteMsgs && remoteMsgs.length > 0) {
          setMessages((prev) => {
            // Fusionner sans doublons
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = remoteMsgs.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        }
      });
    }

    // Souscription Realtime via WebSocket Supabase
    const unsubscribe = supabaseService.subscribeToMessages(activeConversationId, (incomingMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) return prev;
        return [...prev, incomingMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversationId, isSupabaseOnline]);

  // Synchronisation du thème sombre / clair
  useEffect(() => {
    if (userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.theme]);

  // Calcul déterministe réactif de la synthèse financière
  const financialSummary = useMemo(() => {
    return computeFinancialSummary(transactions, scheduledExpenses, savingsGoals, userProfile, incomeSources);
  }, [transactions, scheduledExpenses, savingsGoals, userProfile, incomeSources]);

  // ACTIONS UTILISATEUR & PERSISTANCE
  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...patch, lastUpdated: new Date().toISOString() };
      indexedDBService.put(STORES.USER_PROFILE, { id: 'current_user', ...updated });
      if (supabaseUserId) {
        supabaseService.createOrUpdateProfile(supabaseUserId, {
          fullName: updated.fullName,
          profession: updated.profession,
          city: updated.city,
          country: updated.country,
          currency: updated.currency,
          monthlySalary: updated.monthlySalary,
          salaryDayOfMonth: updated.salaryDayOfMonth,
          declaredInitialBalance: updated.declaredInitialBalance,
        });
      }
      return updated;
    });
  };

  // Module 1 : CORE MONEY
  const addIncomeSource = (source: Omit<IncomeSource, 'id' | 'createdAt'>) => {
    const newInc: IncomeSource = {
      ...source,
      id: `inc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setIncomeSources((prev) => {
      const next = [newInc, ...prev];
      indexedDBService.bulkPut(STORES.INCOME_SOURCES, next);
      return next;
    });
  };

  const deleteIncomeSource = (id: string) => {
    setIncomeSources((prev) => {
      const next = prev.filter((i) => i.id !== id);
      indexedDBService.delete(STORES.INCOME_SOURCES, id);
      return next;
    });
  };

  const addScheduledExpense = async (expense: Omit<ScheduledExpense, 'id'>) => {
    let assignedId = `sched-${Date.now()}`;
    if (supabaseUserId) {
      const remoteId = await supabaseService.createExpense(expense, supabaseUserId);
      if (remoteId) assignedId = remoteId;
    }

    const newSched: ScheduledExpense = {
      ...expense,
      id: assignedId,
    };
    setScheduledExpenses((prev) => {
      const next = [...prev, newSched];
      indexedDBService.bulkPut(STORES.SCHEDULED_EXPENSES, next);
      return next;
    });
  };

  const updateScheduledExpenseStatus = async (id: string, status: ExpenseStatus) => {
    if (supabaseUserId) {
      await supabaseService.updateExpenseStatus(id, status);
    }
    setScheduledExpenses((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            paidAt: status === 'paid' ? new Date().toISOString() : undefined,
          };
        }
        return item;
      });
      indexedDBService.bulkPut(STORES.SCHEDULED_EXPENSES, next);
      return next;
    });
  };

  const deleteScheduledExpense = async (id: string) => {
    if (supabaseUserId) {
      await supabaseService.deleteExpense(id);
    }
    setScheduledExpenses((prev) => {
      const next = prev.filter((s) => s.id !== id);
      indexedDBService.delete(STORES.SCHEDULED_EXPENSES, id);
      return next;
    });
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    let assignedId = `tx-${Date.now()}`;
    if (supabaseUserId) {
      const remoteId = await supabaseService.createTransaction(tx, supabaseUserId);
      if (remoteId) assignedId = remoteId;
    }

    const newTx: Transaction = {
      ...tx,
      id: assignedId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => {
      const next = [newTx, ...prev];
      indexedDBService.bulkPut(STORES.TRANSACTIONS, next);
      return next;
    });

    if (tx.isRecurring && tx.type === 'expense') {
      const newSched: ScheduledExpense = {
        id: `sched-${Date.now()}`,
        title: tx.title,
        amount: tx.amount,
        category: tx.category as any,
        dueDate: tx.date,
        recurrenceDay: parseInt(tx.date.split('-')[2], 10) || 1,
        status: tx.status,
        isRecurring: true,
        isMandatory: tx.isMandatory !== false,
        notes: tx.notes,
      };
      setScheduledExpenses((prev) => {
        const next = [...prev, newSched];
        indexedDBService.bulkPut(STORES.SCHEDULED_EXPENSES, next);
        return next;
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (supabaseUserId) {
      await supabaseService.deleteTransaction(id);
    }
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      indexedDBService.delete(STORES.TRANSACTIONS, id);
      return next;
    });
  };

  // Module 2 : CORE DECISION
  const runDecisionAnalysis = (req: DecisionAnalysisRequest): DecisionAnalysisResult => {
    return analyzePurchaseDecision(req);
  };

  // Module 4 : CORE GOALS
  const addSavingsGoal = (
    goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'isReached' | 'history' | 'createdAt'>
  ) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
      isReached: false,
      history: [],
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals((prev) => {
      const next = [...prev, newGoal];
      indexedDBService.bulkPut(STORES.SAVINGS_GOALS, next);
      return next;
    });
  };

  const depositToSavingsGoal = (id: string, amount: number, note?: string) => {
    setSavingsGoals((prev) => {
      const next = prev.map((goal) => {
        if (goal.id === id) {
          const newTotal = goal.currentAmount + amount;
          return {
            ...goal,
            currentAmount: newTotal,
            isReached: newTotal >= goal.targetAmount,
            history: [
              {
                id: `hist-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount,
                type: 'deposit' as const,
                note: note || 'Versement d’épargne déclaré',
              },
              ...goal.history,
            ],
          };
        }
        return goal;
      });
      indexedDBService.bulkPut(STORES.SAVINGS_GOALS, next);
      return next;
    });
  };

  const withdrawFromSavingsGoal = (id: string, amount: number, note?: string) => {
    setSavingsGoals((prev) => {
      const next = prev.map((goal) => {
        if (goal.id === id) {
          const newTotal = Math.max(0, goal.currentAmount - amount);
          return {
            ...goal,
            currentAmount: newTotal,
            isReached: newTotal >= goal.targetAmount,
            history: [
              {
                id: `hist-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount,
                type: 'withdrawal' as const,
                note: note || 'Retrait d’épargne déclaré',
              },
              ...goal.history,
            ],
          };
        }
        return goal;
      });
      indexedDBService.bulkPut(STORES.SAVINGS_GOALS, next);
      return next;
    });
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      indexedDBService.delete(STORES.SAVINGS_GOALS, id);
      return next;
    });
  };

  // Module 5 : CORE BOURSE
  const toggleWatchlist = (assetId: string) => {
    setMarketAssets((prev) => {
      const next = prev.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a));
      indexedDBService.bulkPut(STORES.MARKET_ASSETS, next);
      return next;
    });
  };

  const addMarketAlert = (alert: Omit<MarketAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const newAlert: MarketAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isTriggered: false,
    };
    setMarketAlerts((prev) => {
      const next = [newAlert, ...prev];
      indexedDBService.bulkPut(STORES.MARKET_ALERTS, next);
      return next;
    });
  };

  const deleteMarketAlert = (id: string) => {
    setMarketAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      indexedDBService.delete(STORES.MARKET_ALERTS, id);
      return next;
    });
  };

  // Module 6 & 7 : CORE PROJECTS (Enregistrement Réel Supabase)
  const addProject = async (proj: Omit<ProjectSheet, 'id' | 'createdAt'>): Promise<boolean> => {
    let assignedId = `proj-${Date.now()}`;

    if (supabaseUserId) {
      const res = await supabaseService.createProject(proj, supabaseUserId);
      if (res.success && res.projectId) {
        assignedId = res.projectId;
      }
    }

    const newProject: ProjectSheet = {
      ...proj,
      id: assignedId,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => {
      const next = [newProject, ...prev];
      indexedDBService.bulkPut(STORES.PROJECTS, next);
      return next;
    });

    return true;
  };

  const toggleProjectBookmark = (id: string) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
      indexedDBService.bulkPut(STORES.PROJECTS, next);
      return next;
    });
  };

  // Module 8 : CORE CONNECT (Messagerie Réelle)
  const startOrOpenConversation = (
    projectId: string,
    contactName: string,
    contactRole: string,
    projectTitle: string
  ) => {
    const existing = conversations.find((c) => c.projectId === projectId);
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      return;
    }
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      projectId,
      projectTitle,
      contactName,
      contactRole,
      lastMessage: 'Conversation ouverte.',
      lastMessageTime: 'À l’instant',
      unreadCount: 0,
    };
    setConversations((prev) => {
      const next = [newConv, ...prev];
      indexedDBService.bulkPut(STORES.CONVERSATIONS, next);
      return next;
    });
    setActiveConversationId(newConv.id);
    setActiveTab('messages');
  };

  const sendMessage = async (conversationId: string, text: string, attachmentUrl?: string) => {
    if (!text.trim() && !attachmentUrl) return;

    let assignedMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender: 'user',
      senderName: userProfile.fullName || 'Utilisateur',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attachmentName: attachmentUrl ? attachmentUrl.split('/').pop() : undefined,
    };

    if (supabaseUserId) {
      const sent = await supabaseService.sendMessage(
        conversationId,
        supabaseUserId,
        userProfile.fullName || 'Utilisateur',
        'user',
        text.trim(),
        attachmentUrl
      );
      if (sent) {
        assignedMsg = sent;
      }
    }

    setMessages((prev) => {
      const next = [...prev, assignedMsg];
      indexedDBService.bulkPut(STORES.MESSAGES, next);
      return next;
    });

    setConversations((prev) => {
      const next = prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim() || 'Fichier partagé',
              lastMessageTime: 'À l’instant',
            }
          : c
      );
      indexedDBService.bulkPut(STORES.CONVERSATIONS, next);
      return next;
    });
  };

  // Module 10 : NOTIFICATIONS
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      indexedDBService.bulkPut(STORES.NOTIFICATIONS, next);
      return next;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      indexedDBService.bulkPut(STORES.NOTIFICATIONS, next);
      return next;
    });
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Module 11 : ADMINISTRATION
  const deleteProjectByAdmin = async (projectId: string) => {
    if (isSupabaseOnline) {
      await supabaseService.deleteProject(projectId);
    }
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      indexedDBService.delete(STORES.PROJECTS, projectId);
      return next;
    });
    const log: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: 'SUPPRESSION_PROJET_MODERATEUR',
      target: projectId,
      adminName: userProfile.fullName,
      details: 'Suppression pour non-conformité ou demande du porteur.',
    };
    setAuditLogs((prev) => {
      const next = [log, ...prev];
      indexedDBService.bulkPut(STORES.AUDIT_LOGS, next);
      return next;
    });
  };

  const resetAllToDefault = async () => {
    await indexedDBService.clearStore(STORES.USER_PROFILE);
    await indexedDBService.clearStore(STORES.INCOME_SOURCES);
    await indexedDBService.clearStore(STORES.SCHEDULED_EXPENSES);
    await indexedDBService.clearStore(STORES.TRANSACTIONS);
    await indexedDBService.clearStore(STORES.SAVINGS_GOALS);
    await indexedDBService.clearStore(STORES.MARKET_ASSETS);
    await indexedDBService.clearStore(STORES.MARKET_ALERTS);
    await indexedDBService.clearStore(STORES.PROJECTS);
    await indexedDBService.clearStore(STORES.CONVERSATIONS);
    await indexedDBService.clearStore(STORES.MESSAGES);
    await indexedDBService.clearStore(STORES.NOTIFICATIONS);
    await indexedDBService.clearStore(STORES.AUDIT_LOGS);

    setUserProfile(DEFAULT_USER_PROFILE);
    setIncomeSources(DEFAULT_INCOME_SOURCES);
    setScheduledExpenses(DEFAULT_SCHEDULED_EXPENSES);
    setTransactions(DEFAULT_TRANSACTIONS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    setMarketAssets(DEFAULT_MARKET_ASSETS);
    setMarketAlerts([]);
    setProjects(DEFAULT_PROJECTS);
    setConversations(DEFAULT_CONVERSATIONS);
    setMessages(DEFAULT_MESSAGES);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setAuditLogs(DEFAULT_AUDIT_LOGS);
  };

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfigState>(() => storageService.getSupabaseConfig());

  const updateSupabaseConfig = (cfg: Partial<SupabaseConfigState>) => {
    setSupabaseConfig((prev) => {
      const updated = { ...prev, ...cfg };
      storageService.saveSupabaseConfig(updated);
      return updated;
    });
  };

  const exportDataJson = (): string => {
    const backup = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      incomeSources,
      scheduledExpenses,
      transactions,
      savingsGoals,
      marketAssets,
      marketAlerts,
      projects,
      conversations,
      messages,
      notifications,
      supabaseConfig,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.userProfile) {
        setUserProfile(data.userProfile);
        indexedDBService.put(STORES.USER_PROFILE, { id: 'current_user', ...data.userProfile });
      }
      if (Array.isArray(data.incomeSources)) {
        setIncomeSources(data.incomeSources);
        indexedDBService.bulkPut(STORES.INCOME_SOURCES, data.incomeSources);
      }
      if (Array.isArray(data.scheduledExpenses)) {
        setScheduledExpenses(data.scheduledExpenses);
        indexedDBService.bulkPut(STORES.SCHEDULED_EXPENSES, data.scheduledExpenses);
      }
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        indexedDBService.bulkPut(STORES.TRANSACTIONS, data.transactions);
      }
      if (Array.isArray(data.savingsGoals)) {
        setSavingsGoals(data.savingsGoals);
        indexedDBService.bulkPut(STORES.SAVINGS_GOALS, data.savingsGoals);
      }
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
        indexedDBService.bulkPut(STORES.PROJECTS, data.projects);
      }
      if (data.supabaseConfig) {
        setSupabaseConfig(data.supabaseConfig);
        storageService.saveSupabaseConfig(data.supabaseConfig);
      }
      return true;
    } catch (err) {
      console.error('Import JSON failed:', err);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isOfflineReady,
        isSupabaseOnline,
        supabaseUserId,
        userProfile,
        updateUserProfile,
        incomeSources,
        addIncomeSource,
        deleteIncomeSource,
        scheduledExpenses,
        addScheduledExpense,
        updateScheduledExpenseStatus,
        deleteScheduledExpense,
        transactions,
        addTransaction,
        deleteTransaction,
        financialSummary,
        runDecisionAnalysis,
        savingsGoals,
        addSavingsGoal,
        depositToSavingsGoal,
        withdrawFromSavingsGoal,
        deleteSavingsGoal,
        marketAssets,
        toggleWatchlist,
        marketAlerts,
        addMarketAlert,
        deleteMarketAlert,
        projects,
        addProject,
        toggleProjectBookmark,
        selectedProjectForDetail,
        setSelectedProjectForDetail,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startOrOpenConversation,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        auditLogs,
        deleteProjectByAdmin,
        resetAllToDefault,
        supabaseConfig,
        updateSupabaseConfig,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
