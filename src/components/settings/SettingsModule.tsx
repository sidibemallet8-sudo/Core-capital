/**
 * CORE CAPITAL — Module Profil, Paramètres & Préparation Supabase
 * Configuration utilisateur, devise FCFA, export/import JSON et passerelle Supabase.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { storageService } from '../../services/storageService';
import {
  Settings,
  User,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Code,
  Globe,
  Bell,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    supabaseConfig,
    updateSupabaseConfig,
    resetAllToDefault,
    exportDataJson,
    importDataJson,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'profile' | 'supabase' | 'backup'>('profile');
  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Formulaire profil
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [profession, setProfession] = useState(userProfile.profession);
  const [city, setCity] = useState(userProfile.city);
  const [country, setCountry] = useState(userProfile.country);
  const [currency, setCurrency] = useState(userProfile.currency);
  const [salary, setSalary] = useState(userProfile.monthlySalary.toString());
  const [salaryDay, setSalaryDay] = useState(userProfile.salaryDayOfMonth.toString());

  // Formulaire Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.supabaseAnonKey);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      profession,
      city,
      country,
      currency: currency as any,
      monthlySalary: parseFloat(salary) || 50000,
      salaryDayOfMonth: parseInt(salaryDay, 10) || 28,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig({
      supabaseUrl,
      supabaseAnonKey,
      isSyncReady: !!(supabaseUrl && supabaseAnonKey),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(storageService.getSupabaseSqlSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `core_capital_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJson(content);
        if (ok) {
          setImportStatus('Données importées avec succès !');
        } else {
          setImportStatus('Erreur : format de fichier JSON invalide.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Paramètres & Architecture</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Profil, Devise & Connexion Supabase
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personnalisez vos paramètres régionaux et préparez la synchronisation cloud future.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Modifications enregistrées avec succès dans le stockage local !</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3 bg-blue-950/80 border border-blue-800/80 rounded-xl text-blue-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Onglets de configuration */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === 'profile'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Profil & Devise
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === 'supabase'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Passerelle Supabase
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === 'backup'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sauvegarde JSON
        </button>
      </div>

      {/* 1. ONGLET PROFIL */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-blue-400" />
            <span>Informations Utilisateur & Références Financières</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Profession / Activité</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ville de résidence</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pays</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Devise de travail</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="FCFA">FCFA (Franc CFA - XOF / XAF)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Salaire mensuel déclaré ({currency})
                </label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jour habituel de paie (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={salaryDay}
                  onChange={(e) => setSalaryDay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer"
              >
                Mettre à jour le profil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. ONGLET PASSERELLE SUPABASE */}
      {activeTab === 'supabase' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/50 space-y-2 text-xs">
            <h2 className="font-bold text-blue-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Architecture Prête pour Supabase Cloud</span>
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Le prototype CORE CAPITAL V1 utilise un stockage local déterministe et intègre déjà les contrats de données PostgreSQL / Supabase avec support complet de Row Level Security (RLS) pour le multi-utilisateur futur.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Paramètres de Connexion Supabase (Optionnel)</h3>
            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL du projet Supabase
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clé Anonyme Publique (anon key)
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all cursor-pointer"
                >
                  Sauvegarder les paramètres de synchronisation
                </button>
              </div>
            </form>
          </div>

          {/* Schéma SQL Prêt à être déployé */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Schéma SQL DDL Prêt pour Supabase Studio</span>
              </span>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copié !' : 'Copier le script SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-400 overflow-x-auto max-h-48 border border-slate-800/80">
              {storageService.getSupabaseSqlSchema()}
            </pre>
          </div>
        </div>
      )}

      {/* 3. ONGLET SAUVEGARDE & RESTAURATION */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Exporter ou Importer vos Données</span>
            </h2>
            <p className="text-xs text-slate-400">
              Exportez un fichier JSON complet de vos transactions, échéances, épargne et profils pour conserver une copie locale sur votre ordinateur ou téléphone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block">Exporter les données</span>
              <p className="text-xs text-slate-400">
                Génère un fichier de sauvegarde `.json` horodaté contenant l'intégralité de vos déclarations.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger la sauvegarde JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block">Importer une sauvegarde</span>
              <p className="text-xs text-slate-400">
                Restaurez vos données à partir d'un fichier JSON CORE CAPITAL précédemment exporté.
              </p>
              <label className="w-full py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 border border-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Choisir un fichier JSON...</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Bouton Réinitialiser Démo */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-300 block">Restaurer le Scénario Démo Officiel</span>
              <p className="text-xs text-slate-400">
                Recharge les données de base : Salaire 50 000 FCFA, Loyer 15 000 FCFA, etc.
              </p>
            </div>
            <button
              onClick={resetAllToDefault}
              className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-xl hover:bg-rose-900/40 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Restaurer la démo 50k FCFA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
