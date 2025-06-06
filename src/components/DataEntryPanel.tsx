import React, { useEffect } from 'react';
import { useReportData } from '../hooks/useReportData';
import ReportHeader from './ReportHeader';
import ProductionTable from './ProductionTable';
import ObservationsSection from './ObservationsSection';
import SummarySection from './SummarySection';
import { Save, FileDown, ArrowLeft, Package } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import Card from './Card';
import Button from './Button';
import toast from 'react-hot-toast';

interface DataEntryPanelProps {
  onBack: () => void;
}

const DataEntryPanel: React.FC<DataEntryPanelProps> = ({ onBack }) => {
  const {
    reportData,
    updateReportHeader,
    updateCollaborator,
    addCollaborator,
    removeCollaborator,
    updateObservation,
    saveToHistory,
    setReportData
  } = useReportData();

  const handleExport = async () => {
    try {
      const filename = `relatorio-manutencao-${reportData.header.date}`;
      await exportToPDF('report-content', filename);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  // Calcular totais para o estoque
  const stockPreview = {
    v1: reportData.morning.reduce((sum, c) => sum + (c.tested || 0), 0) +
        reportData.afternoon.reduce((sum, c) => sum + (c.tested || 0), 0),
    v9: reportData.morning.reduce((sum, c) => sum + (c.v9 || 0), 0) +
        reportData.afternoon.reduce((sum, c) => sum + (c.v9 || 0), 0)
  };

  const handleSave = async () => {
    try {
      await saveToHistory();
      toast.success('Relatório salvo e estoque atualizado!');
      onBack();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar relatório');
    }
  };

  // Calcular dados do resumo
  const calculateSummary = () => {
    const morningCollaborators = reportData.morning.filter(c => c.name.trim() !== '').length;
    const afternoonCollaborators = reportData.afternoon.filter(c => c.name.trim() !== '').length;

    const summary = {
      totalEquipment: stockPreview.v1 + stockPreview.v9,
      testedEquipment: stockPreview.v1,
      cleanedEquipment: reportData.morning.reduce((sum, c) => sum + (c.cleaned || 0), 0) +
                       reportData.afternoon.reduce((sum, c) => sum + (c.cleaned || 0), 0),
      resetEquipment: reportData.morning.reduce((sum, c) => sum + (c.resetados || 0), 0) +
                     reportData.afternoon.reduce((sum, c) => sum + (c.resetados || 0), 0),
      v9Equipment: stockPreview.v9,
      totalCollaborators: morningCollaborators + afternoonCollaborators,
      morningCollaborators,
      afternoonCollaborators
    };

    return summary;
  };

  // Atualizar o resumo sempre que os colaboradores mudarem
  useEffect(() => {
    const summary = calculateSummary();
    setReportData(prev => ({
      ...prev,
      summary
    }));
  }, [reportData.morning, reportData.afternoon]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center justify-between mb-10">
          <Button variant="secondary" onClick={onBack} className="flex items-center px-5 py-2.5">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Preenchimento do Relatório
          </h1>
        </div>

        <div className="space-y-10">
          <div id="report-content" className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Relatório de Manutenção</h1>
              <p className="text-gray-600 mt-2">ZTE 670L - Controle de Produção</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informações do Relatório</h2>
              <ReportHeader
                date={reportData.header.date}
                supervisor={reportData.header.supervisor}
                unit={reportData.header.unit}
                onUpdate={updateReportHeader}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Equipamentos Processados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">ZTE 670 V1</p>
                    <p className="text-2xl font-bold text-blue-600">{stockPreview.v1}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">ZTE 670 V9</p>
                    <p className="text-2xl font-bold text-purple-600">{stockPreview.v9}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Período da Manhã (08:00-12:00)</h2>
              <ProductionTable
                title="Produção - Manhã"
                collaborators={reportData.morning}
                onUpdate={(index, field, value) => updateCollaborator('morning', index, field, value)}
                onAdd={() => addCollaborator('morning')}
                onRemove={(index) => removeCollaborator('morning', index)}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Período da Tarde (13:00-17:00)</h2>
              <ProductionTable
                title="Produção - Tarde"
                collaborators={reportData.afternoon}
                onUpdate={(index, field, value) => updateCollaborator('afternoon', index, field, value)}
                onAdd={() => addCollaborator('afternoon')}
                onRemove={(index) => removeCollaborator('afternoon', index)}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Observações</h2>
              <ObservationsSection
                observations={reportData.observations}
                onUpdate={updateObservation}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo da Produção</h2>
              <SummarySection
                summary={reportData.summary}
                morning={reportData.morning}
                afternoon={reportData.afternoon}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="primary" onClick={handleExport} className="flex items-center px-6 py-3">
            <FileDown className="w-5 h-5 mr-2" />
            Exportar Relatório (PDF)
          </Button>
          <Button variant="success" onClick={handleSave} className="flex items-center px-6 py-3">
            <Save className="w-5 h-5 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryPanel;