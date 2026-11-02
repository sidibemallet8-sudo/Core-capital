/**
 * CORE CAPITAL — Panneau Google Workspace (Drive & Sheets)
 * Permet l'authentification officielle Google Workspace et la synchronisation réelle
 * avec Google Sheets et Google Drive.
 */

import React, { useState, useEffect } from 'react';
import { googleWorkspaceService, DriveFileInfo } from '../../services/googleWorkspaceService';
import { useFinance } from '../../context/FinanceContext';
import {
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';

export const GoogleWorkspacePanel: React.FC = () => {
  const { scheduledExpenses, incomeSources, financialSummary, userProfile, exportDataJson } = useFinance();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<DriveFileInfo[]>([]);
  const [lastCreatedSheetUrl, setLastCreatedSheetUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = googleWorkspaceService.initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        loadRecentFiles();
      },
      () => {
        setUser(null);
        setRecentFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadRecentFiles = async () => {
    try {
      const files = await googleWorkspaceService.listRecentDriveFiles();
      setRecentFiles(files);
    } catch {}
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await googleWorkspaceService.signIn();
      setUser(res.user);
      setSuccessMsg(`Connecté avec succès en tant que ${res.user.displayName || res.user.email}`);
      await loadRecentFiles();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de la connexion Google Workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleWorkspaceService.signOut();
    setUser(null);
    setRecentFiles([]);
    setSuccessMsg('Déconnecté de Google Workspace.');
  };

  const handleCreateSheet = async () => {
    if (!user) {
      setErrorMsg('Veuillez d’abord vous connecter à Google Workspace ci-dessous.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const title = `Budget & Échéances ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      const { spreadsheetUrl } = await googleWorkspaceService.createFinanceSpreadsheet(
        title,
        scheduledExpenses,
        incomeSources,
        userProfile.currency
      );
      setLastCreatedSheetUrl(spreadsheetUrl);
      setSuccessMsg('Classeur Google Sheets créé et synchronisé avec succès !');
      await loadRecentFiles();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Échec de la création du classeur Google Sheets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackupToDrive = async () => {
    if (!user) {
      setErrorMsg('Veuillez d’abord vous connecter à Google Workspace ci-dessous.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const fileName = `core-capital-backup-${new Date().toISOString().split('T')[0]}.json`;
      const content = exportDataJson();
      const res = await googleWorkspaceService.exportReportToDrive(fileName, content, 'application/json');
      setSuccessMsg(`Sauvegarde exportée avec succès sur Google Drive (ID: ${res.fileId}).`);
      await loadRecentFiles();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Échec de l’envoi de la sauvegarde vers Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Google Workspace (Drive & Sheets)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-mono">
                API Officielle Connectée
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exportez vos tableaux de bord budgétaires vers Google Sheets et archivez vos données sur Google Drive.
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnecter Google</span>
          </button>
        )}
      </div>

      {/* Messages d'alerte / succès */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* État connecté vs non connecté */}
      {!user ? (
        <div className="py-6 px-4 text-center rounded-xl bg-slate-950/50 border border-dashed border-slate-800 space-y-4">
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-sm font-semibold text-white">Connexion à votre compte Google</h4>
            <p className="text-xs text-slate-400">
              Autorisez CORE CAPITAL à créer votre feuille de calcul budgétaire sur Google Sheets et à sauvegarder vos fiches de projet dans Google Drive avec votre accord.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoading ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Info utilisateur connecté */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-xs">
                {(user.displayName || user.email || 'G')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-white">
                Compte Google actif : <span className="text-blue-400 font-medium">{user.displayName || user.email}</span>
              </div>
              <span className="text-[11px] text-slate-400">{user.email}</span>
            </div>
          </div>

          {/* Boutons d'actions réelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={handleCreateSheet}
              disabled={isLoading}
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-800/60 hover:border-emerald-600/80 transition-all text-left flex items-start gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Créer une feuille Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Exporte {scheduledExpenses.length} échéances et {incomeSources.length} sources de revenus dans un classeur Google Sheets formaté.
                </p>
              </div>
            </button>

            <button
              onClick={handleExportBackupToDrive}
              disabled={isLoading}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-950 border border-blue-800/60 hover:border-blue-600/80 transition-all text-left flex items-start gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Sauvegarder sur Google Drive</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Archive une copie chiffrée de votre profil, budgets et objectifs directement dans votre Drive personnel.
                </p>
              </div>
            </button>
          </div>

          {/* Lien vers le dernier classeur créé */}
          {lastCreatedSheetUrl && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Votre classeur Google Sheets est prêt à être consulté !</span>
              </div>
              <a
                href={lastCreatedSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                <span>Ouvrir Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Fichiers récents sur Google Drive */}
          {recentFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Fichiers récents sur votre Google Drive</span>
                </span>
                <button
                  onClick={loadRecentFiles}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Actualiser</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {recentFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {f.mimeType.includes('spreadsheet') ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <HardDrive className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="text-slate-200 truncate">{f.name}</span>
                    </div>

                    {f.webViewLink && (
                      <a
                        href={f.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Consulter</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
