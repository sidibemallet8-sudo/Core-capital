/**
 * CORE CAPITAL — Client Supabase PostgreSQL & Auth
 * Projet Supabase : ncedgklsuxiiprlgbkti
 * URL : https://ncedgklsuxiiprlgbkti.supabase.co
 * Gère la connexion avec Supabase, l'authentification et les canaux Realtime.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { storageService } from './storageService';

export const DEFAULT_SUPABASE_URL = 'https://ncedgklsuxiiprlgbkti.supabase.co';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  // 1. Recherche dans les variables d'environnement Vite ou valeur par défaut du projet
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && envKey.trim().length > 10) {
    try {
      supabaseInstance = createClient(envUrl, envKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('[Supabase] Erreur initialisation client env:', e);
    }
  }

  // 2. Recherche dans les paramètres locaux déclarés par l'utilisateur
  const storedConfig = storageService.getSupabaseConfig();
  const targetUrl = storedConfig.supabaseUrl || envUrl || DEFAULT_SUPABASE_URL;
  const targetKey = storedConfig.supabaseAnonKey || envKey;

  if (targetUrl && targetKey && targetKey.trim().length > 10) {
    try {
      supabaseInstance = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('[Supabase] Erreur initialisation client stocké:', e);
    }
  }

  return null;
}

export function isSupabaseConnected(): boolean {
  return getSupabaseClient() !== null;
}

export function resetSupabaseInstance(): void {
  supabaseInstance = null;
}
