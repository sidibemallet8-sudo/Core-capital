/**
 * CORE CAPITAL V3 — MODULE 6 & 7 : CORE PROJECTS & GRAPHIQUES CORE IMPACT
 * Marketplace de projets économiques en Afrique, graphiques d'analyse boursière
 * de projets (scénarios 1, 3, 5 ans), comparaison africaine sourcée et passerelle CORE CONNECT.
 */

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ProjectSheet, ProjectSector } from '../../types';
import {
  Briefcase,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  MessageSquare,
  Phone,
  Layers,
  ArrowRight,
  BarChart2,
  AlertOctagon,
  FileText,
  Building,
  CheckCircle2,
  ExternalLink,
  Plus,
  Download,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CreateProjectModal } from './CreateProjectModal';
import { csvExportService } from '../../services/csvExportService';

export const CoreProjectsModule: React.FC = () => {
  const { projects, toggleProjectBookmark, startOrOpenConversation, userProfile } = useFinance();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedSector, setSelectedSector] = useState<'all' | ProjectSector>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailProject, setDetailProject] = useState<ProjectSheet | null>(null);

  // Contrôles du graphique de simulation dans la modale
  const [scenarioYear, setScenarioYear] = useState<1 | 3 | 5>(3);
  const [activeScenarioType, setActiveScenarioType] = useState<'intermediate' | 'unfavorable' | 'favorable'>('intermediate');
  const [showTrustModal, setShowTrustModal] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSector = selectedSector === 'all' || p.sector === selectedSector;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const getSectorLabel = (sector: ProjectSector) => {
    const map: Record<ProjectSector, string> = {
      agriculture: 'Agriculture & Agro-alimentaire',
      elevage: 'Élevage & Aviculture',
      technologie: 'Technologie & Numérique',
      education: 'Éducation & Formation',
      sante: 'Santé & Biomédical',
      energie: 'Énergie & Solaire',
      transport: 'Transport & Mobilité',
      immobilier: 'Habitat & Immobilier',
      commerce: 'Commerce & Distribution',
      industrie: 'Industrie & Transformation',
      services: 'Services & Conseil',
      autre: 'Autre Secteur',
    };
    return map[sector] || sector;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* En-tête Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>MODULE 6 & 7 — MARCHÉ DE PROJETS ÉCONOMIQUES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            CORE PROJECTS & GRAPHIQUES D’IMPACT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Découvrez des projets entrepreneuriaux crédibles en Afrique, modélisés comme des actifs financiers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => csvExportService.exportProjectsToCsv(projects)}
            title="Exporter la liste des projets au format CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publier un projet</span>
          </button>
        </div>
      </div>

      {/* AVERTISSEMENT LÉGAL SUR LES PROJECTIONS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Avertissement de transparence :</strong> Les projections présentées dans ce module sont des simulations théoriques fondées sur des hypothèses économiques déclarées. Elles ne représentent pas une performance réelle ni une garantie de réussite. CORE CAPITAL n’autorise aucune souscription publique de capitaux dans cette version.
        </p>
      </div>

      {/* RECHERCHE & FILTRES PAR SECTEUR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, secteur, pays ou ville..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedSector === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous ({projects.length})
          </button>
          <button
            onClick={() => setSelectedSector('agriculture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedSector === 'agriculture' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agriculture
          </button>
          <button
            onClick={() => setSelectedSector('energie')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedSector === 'energie' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Énergie
          </button>
        </div>
      </div>

      {/* GRILLE DES FICHES PROJETS */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">Aucun projet publié pour le moment.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Soyez le premier à présenter votre projet économique et à le modéliser avec des graphiques d’impact.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Présenter un projet maintenant</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/core-capital-icon.png"
                    alt="Logo projet"
                    className="w-10 h-10 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1"
                  />
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                      {getSectorLabel(proj.sector)}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {proj.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono shrink-0">
                  {proj.stage}
                </span>
              </div>

              {/* Localisation & Capital recherché */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{proj.city}, {proj.country}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Durée : {proj.estimatedDurationMonths} mois</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 line-clamp-3">
                {proj.description}
              </p>

              {/* Résumé Métriques Boursières Projet */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Besoin Capital</span>
                  <span className="font-bold font-mono text-emerald-400">
                    {proj.capitalTarget ? `${(proj.capitalTarget / 1000000).toFixed(1)}M FCFA` : 'Non précisé'}
                  </span>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Emplois (An 3)</span>
                  <span className="font-bold font-mono text-white">
                    ~{proj.scenarios[1]?.intermediate.jobs || 14} créations
                  </span>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Confiance Audit</span>
                  <span className="font-bold text-blue-300 text-[11px]">
                    {proj.trust.verificationLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons d'Action Rapide */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => setDetailProject(proj)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Analyser la fiche & graphiques</span>
              </button>

              <button
                onClick={() => {
                  const contact = proj.publicContacts[0];
                  startOrOpenConversation(proj.id, contact.name, contact.role, proj.title);
                }}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Discuter dans CORE CAPITAL"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* MODAL FICHE PROJET COMPLÈTE & GRAPHIQUES D'IMPACT (MODULE 7) */}
      {detailProject && (
        <Modal
          isOpen={!!detailProject}
          onClose={() => setDetailProject(null)}
          title={detailProject.title}
          subtitle={`${detailProject.city}, ${detailProject.country} · ${getSectorLabel(detailProject.sector)}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs text-slate-200">
            {/* 1. MODULE 8 : LES 3 BOUTONS CORE CONNECT OBLIGATOIRES */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-white text-xs block">
                Contacter le porteur de projet :
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {/* Bouton 1 : Discuter dans CORE CAPITAL */}
                <button
                  onClick={() => {
                    const c = detailProject.publicContacts[0];
                    startOrOpenConversation(detailProject.id, c.name, c.role, detailProject.title);
                    setDetailProject(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>1. Discuter dans CORE CAPITAL</span>
                </button>

                {/* Bouton 2 : Appeler le responsable */}
                {detailProject.publicContacts[0]?.phone && (
                  <a
                    href={`tel:${detailProject.publicContacts[0].phone}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Appeler</span>
                  </a>
                )}

                {/* Bouton 3 : Contacter sur WhatsApp */}
                {detailProject.publicContacts[0]?.whatsapp && (
                  <a
                    href={`https://wa.me/${detailProject.publicContacts[0].whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Bonjour ${detailProject.publicContacts[0].name}, je vous contacte au sujet de votre projet "${detailProject.title}" découvert sur CORE CAPITAL.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>3. WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* 2. PRÉSENTATION DU PROBLÈME ET DE LA SOLUTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-rose-300 block">Le Problème Résolu</span>
                <p className="text-slate-300 leading-relaxed">{detailProject.problemStatement}</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 block">La Solution Apportée</span>
                <p className="text-slate-300 leading-relaxed">{detailProject.proposedSolution}</p>
              </div>
            </div>

            {/* 3. MODULE 7 : GRAPHIQUES DE SIMULATION DE PROJET (1, 3, 5 ANS & 3 SCÉNARIOS) */}
            <div className="bg-slate-950 rounded-2xl border border-blue-900/50 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Graphique d'Impact & Évolution Théorique (CORE IMPACT)
                  </h4>
                </div>

                {/* Sélecteur d'horizon temporel (1, 3, 5 ans) */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                  {([1, 3, 5] as const).map((y) => (
                    <button
                      key={y}
                      onClick={() => setScenarioYear(y)}
                      className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                        scenarioYear === y ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {y} an{y > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélecteur de scénario (Défavorable, Intermédiaire, Favorable) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveScenarioType('unfavorable')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeScenarioType === 'unfavorable'
                      ? 'bg-rose-950 text-rose-300 border border-rose-900'
                      : 'text-slate-400 bg-slate-900'
                  }`}
                >
                  Scénario Défavorable
                </button>
                <button
                  onClick={() => setActiveScenarioType('intermediate')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeScenarioType === 'intermediate'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 bg-slate-900'
                  }`}
                >
                  Scénario Intermédiaire
                </button>
                <button
                  onClick={() => setActiveScenarioType('favorable')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeScenarioType === 'favorable'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                      : 'text-slate-400 bg-slate-900'
                  }`}
                >
                  Scénario Favorable
                </button>
              </div>

              {/* Données du scénario sélectionné */}
              {(() => {
                const scenData =
                  detailProject.scenarios.find((s) => s.year === scenarioYear)?.[activeScenarioType] ||
                  detailProject.scenarios[0].intermediate;

                return (
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Revenus théoriques</span>
                      <span className="font-bold font-mono text-emerald-400 text-xs sm:text-sm">
                        {(scenData.revenue / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Emplois directs créés</span>
                      <span className="font-bold font-mono text-white text-xs sm:text-sm">
                        {scenData.jobs} postes
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{scenData.outputMetric}</span>
                      <span className="font-bold font-mono text-blue-300 text-xs sm:text-sm">
                        {scenData.outputValue}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 4. COMPARAISON AFRICAINE SOURCÉE (MODULE 7) */}
            <div className="p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-xl space-y-1.5">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Mise en Perspective Africaine (Statistiques Sourcées)
              </span>
              <p className="text-slate-300 font-semibold">
                {detailProject.africanComparison.issueTitle}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Constat macro : <strong className="text-slate-200">{detailProject.africanComparison.keyStat}</strong></span>
                <span className="text-blue-400 font-mono">Source : {detailProject.africanComparison.source}</span>
              </div>
              <p className="text-[11px] text-slate-300 italic pt-1 border-t border-blue-900/30">
                Contribution du projet : {detailProject.africanComparison.projectContribution}
              </p>
            </div>

            {/* 5. ESPACE DE TRANSPARENCE & CONFIANCE (MODULE 9 : CORE TRUST) */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>CORE TRUST — Dossier de Transparence</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  {detailProject.trust.verificationLevel}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <div>
                  <strong className="text-slate-300">Documents examinés :</strong>{' '}
                  {detailProject.trust.documentsReceived.join(', ')}.
                </div>
                {detailProject.trust.documentsMissing.length > 0 && (
                  <div>
                    <strong className="text-amber-400">Pièces complémentaires attendues :</strong>{' '}
                    {detailProject.trust.documentsMissing.join(', ')}.
                  </div>
                )}
                <div>
                  <strong className="text-rose-400">Risques identifiés par l’audit :</strong>{' '}
                  {detailProject.trust.identifiedRisks.join(' ; ')}.
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL CRÉATION & PUBLICATION DE PROJET */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
