import { useState, useEffect } from 'react';
import axios from 'axios';
import { Report, DashboardData } from '../../../backend/src/types/report';

interface UseReportsReturn {
  reports: Report[];
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  saveReport: (report: Omit<Report, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteReport: (date: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/reports`);
      setReports(response.data);
      
      // Calcular dados do dashboard com base no relatório mais recente
      if (response.data.length > 0) {
        const latestReport = response.data[0];
        setDashboardData(latestReport.dashboardData);
      }
      
      setError(null);
    } catch (err) {
      setError('Erro ao carregar relatórios');
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async (report: Omit<Report, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await axios.post(`${API_URL}/api/reports`, report);
      await fetchReports();
    } catch (err) {
      console.error('Erro ao salvar relatório:', err);
      throw err;
    }
  };

  const deleteReport = async (date: string) => {
    try {
      await axios.delete(`${API_URL}/api/reports/${date}`);
      await fetchReports();
    } catch (err) {
      console.error('Erro ao excluir relatório:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    dashboardData,
    loading,
    error,
    saveReport,
    deleteReport,
    refreshReports: fetchReports
  };
} 