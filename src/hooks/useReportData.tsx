import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useStock } from './useStock';
import { ReportData } from '../types/report';
import { endpoints } from '../config/api';
import toast from 'react-hot-toast';

// Tipos do relatório
export interface Collaborator {
  name: string;
  tested: number;
  cleaned: number;
  resetados: number;
  v9: number;
}

const emptyCollaborator = (): Collaborator => ({
  name: '',
  tested: 0,
  cleaned: 0,
  resetados: 0,
  v9: 0
});

const initialReportData: ReportData = {
  header: {
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    supervisor: '',
    unit: ''
  },
  morning: [{
    name: '',
    tested: 0,
    approved: 0,
    rejected: 0,
    cleaned: 0,
    resetados: 0,
    v9: 0
  }],
  afternoon: [{
    name: '',
    v9: 0,
    reset: 0,
    cleaning: 0,
    tested: 0,
    cleaned: 0,
    resetados: 0
  }],
  observations: {
    issues: '',
    highlights: '',
    attentionPoints: ''
  },
  summary: {
    totalTested: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalV9: 0,
    totalReset: 0,
    totalCleaning: 0,
    totalEquipment: 0,
    testedEquipment: 0,
    cleanedEquipment: 0,
    resetEquipment: 0,
    v9Equipment: 0,
    totalCollaborators: 0,
    morningCollaborators: 0,
    afternoonCollaborators: 0
  }
};

const STORAGE_KEY = 'zte670_report_data';

interface ReportDataContextType {
  reportData: ReportData;
  updateReportHeader: (field: 'date' | 'supervisor' | 'unit', value: string) => void;
  updateCollaborator: (period: 'morning' | 'afternoon', index: number, field: keyof Collaborator, value: any) => void;
  addCollaborator: (period: 'morning' | 'afternoon') => void;
  removeCollaborator: (period: 'morning' | 'afternoon', index: number) => void;
  updateObservation: (field: keyof typeof initialReportData.observations, value: string) => void;
  resetData: () => void;
  saveToHistory: () => Promise<void>;
  getHistory: () => Promise<ReportData[]>;
  loadFromHistory: (date: string) => Promise<void>;
  setReportData: React.Dispatch<React.SetStateAction<ReportData>>;
  loadHistory: () => Promise<ReportData[]>;
}

const ReportDataContext = createContext<ReportDataContextType | undefined>(undefined);

export const ReportDataProvider = ({ children }: { children: ReactNode }) => {
  const [reportData, setReportData] = useState<ReportData>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      // Corrigir colaboradores antigos sem o campo resetados
      data.morning = Array.isArray(data.morning)
        ? data.morning.map((colab: any) => ({
            ...colab,
            resetados: typeof colab.resetados === 'number' ? colab.resetados : 0
          }))
        : [];
      data.afternoon = Array.isArray(data.afternoon)
        ? data.afternoon.map((colab: any) => ({
            ...colab,
            resetados: typeof colab.resetados === 'number' ? colab.resetados : 0
          }))
        : [];
      return data;
    }
    return initialReportData;
  });

  const { addEntry } = useStock();

  // Função para calcular totais de equipamentos
  const calculateEquipmentTotals = useCallback((morning: Collaborator[], afternoon: Collaborator[]) => {
    const v1Total = morning.reduce((sum, c) => sum + (c.tested || 0), 0) +
                   afternoon.reduce((sum, c) => sum + (c.tested || 0), 0);
    
    const v9Total = morning.reduce((sum, c) => sum + (c.v9 || 0), 0) +
                   afternoon.reduce((sum, c) => sum + (c.v9 || 0), 0);

    return { v1Total, v9Total };
  }, []);

  // Buscar histórico via API
  const getHistory = useCallback(async (): Promise<ReportData[]> => {
    try {
      const response = await fetch(endpoints.reports);
      if (!response.ok) {
        throw new Error('Falha ao buscar relatórios');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao buscar histórico');
      // Fallback para localStorage
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? [JSON.parse(data)] : [];
    }
  }, []);

  // Salvar via API e atualizar estoque
  const saveToHistory = useCallback(async () => {
    try {
      // Verificar se já existe um relatório para esta data
      const response = await fetch(`${endpoints.reports}/${reportData.header.date}`);
      const exists = response.ok;
      
      // Salvar ou atualizar relatório
      const saveResponse = await fetch(`${endpoints.reports}${exists ? `/${reportData.header.date}` : ''}`, {
        method: exists ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!saveResponse.ok) {
        throw new Error('Falha ao salvar relatório');
      }

      // Calcular totais de equipamentos
      const { v1Total, v9Total } = calculateEquipmentTotals(reportData.morning, reportData.afternoon);

      // Adicionar ao estoque se houver equipamentos processados
      if (v1Total > 0) {
        await addEntry({
          model: 'ZTE 670 V1',
          quantity: v1Total,
          source: 'MANUTENÇÃO',
          destination: 'ESTOQUE',
          responsibleUser: reportData.header.supervisor || 'Sistema',
          observations: `Entrada automática do relatório de ${new Date(reportData.header.date).toLocaleDateString()}`
        });
      }

      if (v9Total > 0) {
        await addEntry({
          model: 'ZTE 670 V9',
          quantity: v9Total,
          source: 'MANUTENÇÃO',
          destination: 'ESTOQUE',
          responsibleUser: reportData.header.supervisor || 'Sistema',
          observations: `Entrada automática do relatório de ${new Date(reportData.header.date).toLocaleDateString()}`
        });
      }

      // Manter cópia local
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData));
      toast.success('Relatório salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast.error('Erro ao salvar. Salvando apenas localmente.');
      // Fallback para localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData));
    }
  }, [reportData, addEntry, calculateEquipmentTotals]);

  // Buscar relatório específico
  const getReport = async (date: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reports/${date}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error('Falha ao buscar relatório');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      return null;
    }
  };

  // Carregar via API
  const loadFromHistory = useCallback(async (date: string) => {
    try {
      const report = await getReport(date);
      if (!report) {
        throw new Error('Relatório não encontrado');
      }
      setReportData(report);
      toast.success('Relatório carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar relatório');
    }
  }, []);

  // Otimizar o salvamento no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData));
  }, [reportData]);

  const updateReportHeader = useCallback((field: 'date' | 'supervisor' | 'unit', value: string) => {
    setReportData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value
      }
    }));
  }, []);

  const updateCollaborator = useCallback((
    period: 'morning' | 'afternoon',
    index: number,
    field: keyof Collaborator,
    value: any
  ) => {
    setReportData(prev => ({
      ...prev,
      [period]: prev[period].map((collab, i) => 
        i === index ? { ...collab, [field]: value } : collab
      )
    }));
  }, []);

  const addCollaborator = useCallback((period: 'morning' | 'afternoon') => {
    setReportData(prev => ({
      ...prev,
      [period]: [...prev[period], emptyCollaborator()]
    }));
  }, []);

  const removeCollaborator = useCallback((period: 'morning' | 'afternoon', index: number) => {
    setReportData(prev => ({
      ...prev,
      [period]: prev[period].filter((_, i) => i !== index)
    }));
  }, []);

  const updateObservation = useCallback((field: keyof typeof initialReportData.observations, value: string) => {
    setReportData(prev => ({
      ...prev,
      observations: {
        ...prev.observations,
        [field]: value
      }
    }));
  }, []);

  const resetData = useCallback(() => {
    setReportData(initialReportData);
  }, []);

  const value = {
    reportData,
    updateReportHeader,
    updateCollaborator,
    addCollaborator,
    removeCollaborator,
    updateObservation,
    resetData,
    saveToHistory,
    getHistory,
    loadFromHistory,
    setReportData,
    loadHistory: getHistory
  };

  return (
    <ReportDataContext.Provider value={value}>
      {children}
    </ReportDataContext.Provider>
  );
};

export const useReportData = () => {
  const context = useContext(ReportDataContext);
  if (!context) {
    throw new Error('useReportData must be used within a ReportDataProvider');
  }
  return context;
}; 