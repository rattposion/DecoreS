import { ReportData } from '../types/report';

const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ac65.up.railway.app';

export const reportsApi = {
  async getReports(): Promise<ReportData[]> {
    try {
      const response = await fetch(`${API_URL}/api/reports`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async getReport(date: string): Promise<ReportData> {
    try {
      const response = await fetch(`${API_URL}/api/reports/${date}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      return await response.json();
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  async saveReport(report: ReportData): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/reports/${report.header.date}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
      if (!response.ok) throw new Error('Failed to save report');
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  },

  async deleteReport(date: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/reports/${date}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete report');
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
}; 