import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, Eye } from 'lucide-react';
import { useReportData } from '../hooks/useReportData';
import Card from './Card';
import Button from './Button';
import { exportToPDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';
import ReportDisplay from './ReportDisplay';
import { ReportData } from '../types/report';

const ReportsList: React.FC = () => {
  const { getHistory, setReportData } = useReportData();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const history = await getHistory();
      // Filtra apenas relatórios válidos
      const validReports = (history || []).filter((report: any): report is ReportData => {
        return report && 
               report.header && 
               typeof report.header.date === 'string' &&
               Array.isArray(report.morning) &&
               Array.isArray(report.afternoon);
      });
      setReports(validReports);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report: ReportData) => {
    setSelectedReport(report);
    setReportData(report);
  };

  const handleExport = async (report: ReportData) => {
    try {
      handleView(report);
      await new Promise(resolve => setTimeout(resolve, 500));
      const filename = `relatorio-manutencao-${report.header.date}`;
      await exportToPDF('report-content', filename);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={() => setSelectedReport(null)}
            className="flex items-center"
          >
            Voltar
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport(selectedReport)}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        <div id="report-content">
          <ReportDisplay readOnly report={selectedReport} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios Salvos</h2>
        <Button
          variant="secondary"
          onClick={loadReports}
          className="flex items-center"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Atualizar
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum relatório encontrado</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reports.map((report, index) => (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Relatório de {new Date(report.header.date).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Supervisor: {report.header.supervisor}
                  </p>
                  <p className="text-sm text-gray-500">
                    Unidade: {report.header.unit}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleView(report)}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleExport(report)}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Colaboradores Manhã</p>
                  <p className="text-xl font-bold text-blue-600">
                    {report.morning.length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Colaboradores Tarde</p>
                  <p className="text-xl font-bold text-purple-600">
                    {report.afternoon.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total ZTE 670 V1</p>
                  <p className="text-xl font-bold text-green-600">
                    {report.morning.reduce((sum, c) => sum + (c.tested || 0), 0) +
                     report.afternoon.reduce((sum, c) => sum + (c.tested || 0), 0)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total ZTE 670 V9</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {report.morning.reduce((sum, c) => sum + (c.v9 || 0), 0) +
                     report.afternoon.reduce((sum, c) => sum + (c.v9 || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsList; 