/**
 * CORE CAPITAL V3 — MODULE 11 : ADMINISTRATION
 * Espace réservé de modération, contrôle documentaire et journal d'audit.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileCheck,
  Activity,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AdminModule: React.FC = () => {
  const { projects, deleteProjectByAdmin, auditLogs, userProfile } = useFinance();
  const [activeAdminTab, setActiveAdminTab] = useState<'moderation' | 'logs' | 'users'>('moderation');
  const [notification, setNotification] = useState<string | null>(null);

  const handleDelete = (projId: string, projTitle: string) => {
    deleteProjectByAdmin(projId);
    setNotification(`Le projet "${projTitle}" a été retiré par la modération.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>MODULE 11 — CONTRÔLE & CONFORMITÉ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Administration & Modération de la Plateforme
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Surveillance des fiches projets, conformité documentaire et journal d'audit système.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Rôle : SuperAdmin (Vérifié)</span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cartes KPI Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Projets Répertoriés</span>
          <span className="text-xl font-bold font-mono text-white">{projects.length}</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Audits Réalisés</span>
          <span className="text-xl font-bold font-mono text-blue-400">100%</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Signalements Actifs</span>
          <span className="text-xl font-bold font-mono text-emerald-400">0</span>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Événements Journalisés</span>
          <span className="text-xl font-bold font-mono text-slate-300">{auditLogs.length}</span>
        </div>
      </div>

      {/* Onglets Admin */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeAdminTab === 'moderation' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Modération des Projets
        </button>
        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
            activeAdminTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Journal d'Audit
        </button>
      </div>

      {/* TAB 1 : MODÉRATION DES PROJETS */}
      {activeAdminTab === 'moderation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Contrôle & Modération des Fiches Économiques</span>
            </h2>
            <span className="text-xs text-slate-400">{projects.length} fiches en ligne</span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 font-mono">
                      {proj.trust.verificationLevel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {proj.city}, {proj.country} · Responsable : {proj.publicContacts[0]?.name || 'Anonyme'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/70 hover:bg-rose-900/60 border border-rose-900/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retirer de la plateforme</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2 : JOURNAL D'AUDIT */}
      {activeAdminTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Journal d'Activité & Traçabilité des Actions</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Inaltérable</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-blue-400 font-mono mr-2">[{log.action}]</span>
                  <span className="text-white font-semibold">{log.details}</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">Cible : {log.target} · Opérateur : {log.adminName}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
