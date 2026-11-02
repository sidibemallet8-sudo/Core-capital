/**
 * CORE CAPITAL — Service d'Export CSV Réel
 * Génère et télécharge de véritables fichiers CSV encodés en UTF-8 avec BOM
 * pour ouverture instantanée dans Microsoft Excel, Apple Numbers ou Google Sheets.
 */

import { ScheduledExpense, IncomeSource, Transaction, ProjectSheet } from '../types';

export const csvExportService = {
  /**
   * Télécharge une chaîne CSV sous forme de fichier local
   */
  downloadCsvFile(content: string, fileName: string) {
    const bom = '\uFEFF'; // BOM UTF-8 pour Excel
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Échappe un champ pour le standard CSV
   */
  escapeCsvField(field: any): string {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  },

  /**
   * Export des Dépenses & Échéances
   */
  exportExpensesToCsv(expenses: ScheduledExpense[], currency: string = 'FCFA') {
    const headers = ['ID', 'Titre', `Montant (${currency})`, 'Catégorie', 'Date d’échéance', 'Jour de récurrence', 'Statut', 'Caractère', 'Dette', 'Notes'];
    const rows = expenses.map((exp) => [
      exp.id,
      exp.title,
      exp.amount,
      exp.category,
      exp.dueDate,
      exp.recurrenceDay,
      exp.status === 'paid' ? 'Payé' : exp.status === 'postponed' ? 'Reporté' : 'En attente',
      exp.isMandatory ? 'Obligatoire' : 'Facultative',
      exp.isDebt ? 'Oui' : 'Non',
      exp.notes || '',
    ]);

    const csvContent = [
      headers.map(this.escapeCsvField).join(','),
      ...rows.map((row) => row.map(this.escapeCsvField).join(',')),
    ].join('\n');

    this.downloadCsvFile(csvContent, `core-capital-depenses-${new Date().toISOString().split('T')[0]}.csv`);
  },

  /**
   * Export des Sources de Revenus
   */
  exportIncomesToCsv(incomes: IncomeSource[], currency: string = 'FCFA') {
    const headers = ['ID', 'Titre', `Montant (${currency})`, 'Fréquence', 'Nature', 'Jour de perception', 'Catégorie', 'Notes'];
    const rows = incomes.map((inc) => [
      inc.id,
      inc.title,
      inc.amount,
      inc.frequency,
      inc.nature === 'fixed' ? 'Fixe' : 'Irrégulier',
      inc.receptionDay || '',
      inc.category,
      inc.notes || '',
    ]);

    const csvContent = [
      headers.map(this.escapeCsvField).join(','),
      ...rows.map((row) => row.map(this.escapeCsvField).join(',')),
    ].join('\n');

    this.downloadCsvFile(csvContent, `core-capital-revenus-${new Date().toISOString().split('T')[0]}.csv`);
  },

  /**
   * Export des Transactions
   */
  exportTransactionsToCsv(transactions: Transaction[], currency: string = 'FCFA') {
    const headers = ['ID', 'Type', 'Titre', `Montant (${currency})`, 'Catégorie', 'Date', 'Statut', 'Obligatoire', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      t.type === 'income' ? 'Revenu' : 'Dépense',
      t.title,
      t.amount,
      t.category,
      t.date,
      t.status || 'paid',
      t.isMandatory ? 'Oui' : 'Non',
      t.notes || '',
    ]);

    const csvContent = [
      headers.map(this.escapeCsvField).join(','),
      ...rows.map((row) => row.map(this.escapeCsvField).join(',')),
    ].join('\n');

    this.downloadCsvFile(csvContent, `core-capital-transactions-${new Date().toISOString().split('T')[0]}.csv`);
  },

  /**
   * Export des Projets
   */
  exportProjectsToCsv(projects: ProjectSheet[]) {
    const headers = ['ID', 'Titre', 'Secteur', 'Ville', 'Pays', 'Stade', 'Objectif Financement', 'Description'];
    const rows = projects.map((p) => [
      p.id,
      p.title,
      p.sector,
      p.city,
      p.country,
      p.stage,
      p.capitalTarget || 0,
      p.description,
    ]);

    const csvContent = [
      headers.map(this.escapeCsvField).join(','),
      ...rows.map((row) => row.map(this.escapeCsvField).join(',')),
    ].join('\n');

    this.downloadCsvFile(csvContent, `core-capital-projets-${new Date().toISOString().split('T')[0]}.csv`);
  },
};
