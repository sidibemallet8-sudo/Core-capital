/**
 * CORE CAPITAL — Authentification et Gestion de Compte
 * Inscription, Connexion, Mot de passe oublié, Rôles utilisateur et Connexion Google.
 * Connecté Réellement à Supabase (Projet ncedgklsuxiiprlgbkti).
 */

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { googleWorkspaceService } from '../../services/googleWorkspaceService';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConnected, DEFAULT_SUPABASE_URL, resetSupabaseInstance } from '../../services/supabaseClient';
import { storageService } from '../../services/storageService';
import { Modal } from '../common/Modal';
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useFinance();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'project_owner' | 'moderator' | 'admin'>('user');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration Supabase si clé manquante
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(isSupabaseConnected());
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(!isSupabaseConnected());
  const [anonKeyInput, setAnonKeyInput] = useState<string>(storageService.getSupabaseConfig().supabaseAnonKey || '');

  useEffect(() => {
    setSupabaseConnected(isSupabaseConnected());
  }, [isOpen]);

  const handleSaveAnonKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonKeyInput.trim()) return;

    storageService.saveSupabaseConfig({
      supabaseUrl: DEFAULT_SUPABASE_URL,
      supabaseAnonKey: anonKeyInput.trim(),
      tableNameTransactions: 'transactions',
      tableNameGoals: 'savings_goals',
      isSyncReady: true,
    });
    resetSupabaseInstance();
    const connected = isSupabaseConnected();
    setSupabaseConnected(connected);

    if (connected) {
      setFeedback({
        type: 'success',
        message: 'Base Supabase connectée avec succès ! Vous pouvez maintenant vous inscrire ou vous connecter.',
      });
      setShowConfigPanel(false);
    } else {
      setFeedback({
        type: 'error',
        message: 'Clé invalide ou problème de connexion avec Supabase.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Veuillez saisir une adresse e-mail valide.' });
      setIsSubmitting(false);
      return;
    }

    if (mode !== 'forgot' && password.length < 6) {
      setFeedback({ type: 'error', message: 'Le mot de passe doit comporter au moins 6 caractères.' });
      setIsSubmitting(false);
      return;
    }

    // Cas 1 : Mot de passe oublié
    if (mode === 'forgot') {
      const res = await supabaseService.resetPassword(email.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Un lien de réinitialisation sécurisé a été transmis par Supabase à ${email}. Vérifiez votre boîte de réception.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Erreur lors de la demande de réinitialisation.',
        });
      }
      setIsSubmitting(false);
      return;
    }

    // Cas 2 : Inscription
    if (mode === 'register') {
      const res = await supabaseService.signUp(
        email.trim(),
        password,
        fullName.trim() || email.split('@')[0],
        role
      );

      if (res.success) {
        updateUserProfile({
          fullName: fullName.trim() || email.split('@')[0],
          profession:
            role === 'project_owner'
              ? 'Responsable de Projet'
              : role === 'admin'
              ? 'Administrateur'
              : 'Utilisateur Particulier',
          isAdmin: role === 'admin' || role === 'moderator',
        });

        setFeedback({
          type: 'success',
          message:
            'Compte enregistré dans la base Supabase ! Si un e-mail de confirmation est configuré, veuillez vérifier votre boîte.',
        });

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Erreur lors de l’inscription Supabase.',
        });
      }
      setIsSubmitting(false);
      return;
    }

    // Cas 3 : Connexion
    if (mode === 'login') {
      const res = await supabaseService.signIn(email.trim(), password);

      if (res.success && res.user) {
        // Récupérer le profil réel depuis la base Supabase
        const remoteProfile = await supabaseService.getProfile(res.user.id);
        if (remoteProfile) {
          updateUserProfile(remoteProfile);
        } else {
          updateUserProfile({
            fullName: userProfile.fullName || email.split('@')[0],
          });
        }

        setFeedback({
          type: 'success',
          message: 'Connexion Supabase réussie. Bienvenue sur votre espace CORE CAPITAL.',
        });

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Identifiants invalides ou compte non confirmé.',
        });
      }
      setIsSubmitting(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      setIsSubmitting(true);
      const res = await googleWorkspaceService.signIn();
      updateUserProfile({
        fullName: res.user.displayName || userProfile.fullName,
      });
      setFeedback({
        type: 'success',
        message: `Connecté via Google Workspace (${res.user.email}).`,
      });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erreur lors de la connexion Google.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Espace Personnel & Authentification" maxWidth="md">
      <div className="space-y-4">
        {/* Statut Connexion Supabase */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white">Projet Supabase : </span>
                <span className="text-emerald-400 font-mono">ncedgklsuxiiprlgbkti</span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                supabaseConnected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {supabaseConnected ? 'Connecté' : 'En attente clé anon'}
            </span>
          </div>

          {!supabaseConnected && (
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-400 mb-2">
                Pour synchroniser directement avec la base PostgreSQL de votre projet, saisissez votre clé{' '}
                <strong className="text-slate-200">anon public key</strong> Supabase :
              </p>
              <form onSubmit={handleSaveAnonKey} className="flex gap-2">
                <input
                  type="password"
                  value={anonKeyInput}
                  onChange={(e) => setAnonKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Activer
                </button>
              </form>
            </div>
          )}
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-rose-950/70 border border-rose-800 text-rose-300'
                : 'bg-blue-950/70 border border-blue-800 text-blue-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Onglets Connexion / Inscription / Oubli */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFeedback(null);
            }}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFeedback(null);
            }}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              mode === 'register'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setFeedback(null);
            }}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              mode === 'forgot'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Mot de passe oublié
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom et Prénom
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Aminata Diop"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rôle sur la plateforme
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">Utilisateur Particulier (Gestion personnelle)</option>
                  <option value="project_owner">Responsable de Projet (Publication & Levée)</option>
                  <option value="moderator">Modérateur (Vérification et conformité)</option>
                  <option value="admin">Administrateur Système</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Adresse E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@domaine.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {isSubmitting
              ? 'Traitement en cours...'
              : mode === 'login'
              ? 'Se connecter avec Supabase'
              : mode === 'register'
              ? 'Créer mon compte Supabase'
              : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
            <span className="bg-slate-900 px-2 text-slate-400">Ou avec votre compte</span>
          </div>
        </div>

        {/* Bouton officiel Google Workspace */}
        <button
          type="button"
          onClick={handleGoogleConnect}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <span>Continuer avec Google Workspace</span>
        </button>
      </div>
    </Modal>
  );
};
