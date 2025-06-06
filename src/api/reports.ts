import { ReportData } from '../types/report';
import { endpoints } from '../config/api';

export const reportsApi = {
  async getReports(): Promise<ReportData[]> {
    const response = await fetch(endpoints.reports, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar relatórios');
    }

    return await response.json();
  },

  async getReport(date: string): Promise<ReportData> {
    const response = await fetch(`${endpoints.reports}/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar relatório');
    }

    return await response.json();
  },

  async saveReport(report: ReportData): Promise<void> {
    const response = await fetch(endpoints.reports, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar relatório');
    }
  },

  async updateReport(date: string, report: ReportData): Promise<void> {
    const response = await fetch(`${endpoints.reports}/${date}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar relatório');
    }
  },

  async deleteReport(date: string): Promise<void> {
    const response = await fetch(`${endpoints.reports}/${date}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir relatório');
    }
  }
}; 