/**
 * CORE CAPITAL — Service Google Workspace (Google Drive & Google Sheets)
 * Gère l'authentification OAuth client Firebase et les interactions réelles avec
 * Google Sheets API (v4) et Google Drive API (v3).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ScheduledExpense, IncomeSource } from '../types';

// Initialisation Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider Google avec les scopes autorisés
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Cache du jeton d'accès OAuth en mémoire (pas de localStorage, selon les règles de sécurité)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

export const googleWorkspaceService = {
  /**
   * Écouteur d'état d'authentification
   */
  initAuth(
    onAuthSuccess?: (user: User, token: string) => void,
    onAuthFailure?: () => void
  ) {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  },

  /**
   * Connexion Google OAuth via Popup
   */
  async signIn(): Promise<{ user: User; accessToken: string }> {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error("Impossible d'obtenir le jeton d'accès Google Workspace.");
      }
      cachedAccessToken = credential.accessToken;
      isSigningIn = false;
      return { user: result.user, accessToken: credential.accessToken };
    } catch (err: any) {
      isSigningIn = false;
      console.error('[Google Workspace Auth Error]', err);
      throw err;
    }
  },

  /**
   * Déconnexion Google
   */
  async signOut(): Promise<void> {
    cachedAccessToken = null;
    await firebaseSignOut(auth);
  },

  /**
   * Récupère le jeton en mémoire
   */
  getAccessToken(): string | null {
    return cachedAccessToken;
  },

  /**
   * Vérifie si l'utilisateur est connecté à Google Workspace avec jeton valide
   */
  isAuthenticated(): boolean {
    return !!cachedAccessToken && !!auth.currentUser;
  },

  /**
   * Crée un nouveau classeur Google Sheets avec les données financières réelles de l'utilisateur
   */
  async createFinanceSpreadsheet(
    title: string,
    expenses: ScheduledExpense[],
    incomes: IncomeSource[],
    currency: string
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const token = cachedAccessToken;
    if (!token) {
      throw new Error("Veuillez vous connecter à Google avec vos identifiants pour continuer.");
    }

    // Préparation des lignes pour la feuille "Échéances & Dépenses"
    const expenseRows = [
      ['Titre', 'Montant (' + currency + ')', 'Catégorie', 'Échéance', 'Statut', 'Caractère', 'Notes'],
      ...expenses.map((e) => [
        e.title,
        e.amount,
        e.category,
        e.dueDate,
        e.status === 'paid' ? 'Payé' : e.status === 'postponed' ? 'Reporté' : 'En attente',
        e.isMandatory ? 'Obligatoire' : 'Facultative',
        e.notes || '',
      ]),
    ];

    // Préparation des lignes pour la feuille "Revenus"
    const incomeRows = [
      ['Titre', 'Montant (' + currency + ')', 'Fréquence', 'Nature', 'Jour de perception', 'Catégorie', 'Notes'],
      ...incomes.map((inc) => [
        inc.title,
        inc.amount,
        inc.frequency,
        inc.nature === 'fixed' ? 'Fixe' : 'Irrégulier',
        inc.receptionDay || 1,
        inc.category,
        inc.notes || '',
      ]),
    ];

    // 1. Appel API Google Sheets v4 pour créer le classeur
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `CORE CAPITAL — ${title}`,
        },
        sheets: [
          { properties: { title: 'Échéances & Dépenses' } },
          { properties: { title: 'Sources de Revenus' } },
        ],
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erreur création Google Sheet: ${createRes.statusText}`);
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // 2. Écriture des données dans "Échéances & Dépenses"
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Échéances & Dépenses'!A1:G${expenseRows.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: expenseRows,
        }),
      }
    );

    // 3. Écriture des données dans "Sources de Revenus"
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Sources de Revenus'!A1:G${incomeRows.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: incomeRows,
        }),
      }
    );

    return { spreadsheetId, spreadsheetUrl };
  },

  /**
   * Sauvegarde un rapport ou document JSON/Texte sur Google Drive
   */
  async exportReportToDrive(
    fileName: string,
    content: string,
    mimeType: string = 'text/plain'
  ): Promise<{ fileId: string; webViewLink?: string }> {
    const token = cachedAccessToken;
    if (!token) {
      throw new Error("Veuillez vous connecter à Google pour enregistrer ce fichier dans Google Drive.");
    }

    const metadata = {
      name: fileName,
      mimeType: mimeType,
      description: 'Document exporté depuis la plateforme financière CORE CAPITAL',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erreur d'envoi vers Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return { fileId: data.id, webViewLink: data.webViewLink };
  },

  /**
   * Liste les fichiers récents de l'utilisateur sur Google Drive
   */
  async listRecentDriveFiles(): Promise<DriveFileInfo[]> {
    const token = cachedAccessToken;
    if (!token) return [];

    try {
      const res = await fetch(
        "https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink,createdTime)&q=trashed=false and (mimeType='application/vnd.google-apps.spreadsheet' or mimeType='text/plain' or mimeType='application/json')",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        webViewLink: f.webViewLink,
        createdTime: f.createdTime,
      }));
    } catch (e) {
      console.warn('Erreur listing Google Drive:', e);
      return [];
    }
  },
};
