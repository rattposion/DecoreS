import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Trash2 } from 'lucide-react';
import { useReportData } from '../hooks/useReportData';
import Button from './Button';
import Card from './Card';
import ReportDisplay from './ReportDisplay';
import toast from 'react-hot-toast';
import { endpoints } from '../config/api';

interface Report {
  header: {
    date: string;
    supervisor: string;
    unit: string;
    shift: 'morning' | 'afternoon';
  };
  morning: any[];
  afternoon: any[];
  observations: {
    issues: string;
    highlights: string;
    attentionPoints: string;
  };
  summary: {
    totalTested: number;
    totalApproved: number;
    totalRejected: number;
    totalV9: number;
    totalReset: number;
    totalCleaning: number;
    totalEquipment: number;
    testedEquipment: number;
    cleanedEquipment: number;
    resetEquipment: number;
    v9Equipment: number;
    totalCollaborators: number;
    morningCollaborators: number;
    afternoonCollaborators: number;
  };
}

const SavedReports: React.FC = () => {
  const { getHistory, setReportData } = useReportData();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const history = await getHistory();
      // Filtra apenas relatórios válidos
      const validReports = (history || []).filter((report: any): report is Report => {
        return report && 
               report.header && 
               typeof report.header.date === 'string' &&
               Array.isArray(report.morning) &&
               Array.isArray(report.afternoon);
      });
      setReports(validReports.sort((a, b) => 
        new Date(b.header.date).getTime() - new Date(a.header.date).getTime()
      ));
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setReportData({
      ...report,
      header: {
        ...report.header,
        shift: 'morning'
      },
      summary: {
        ...report.summary,
        totalTested: report.summary.testedEquipment || 0,
        totalApproved: 0,
        totalRejected: 0,
        totalV9: report.summary.v9Equipment || 0,
        totalReset: report.summary.resetEquipment || 0,
        totalCleaning: report.summary.cleanedEquipment || 0,
        totalEquipment: report.summary.totalEquipment || 0,
        testedEquipment: report.summary.testedEquipment || 0,
        cleanedEquipment: report.summary.cleanedEquipment || 0,
        resetEquipment: report.summary.resetEquipment || 0,
        v9Equipment: report.summary.v9Equipment || 0,
        totalCollaborators: report.summary.totalCollaborators || 0,
        morningCollaborators: report.summary.morningCollaborators || 0,
        afternoonCollaborators: report.summary.afternoonCollaborators || 0
      }
    });
  };

  const handleDelete = async (date: string) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      try {
        const response = await fetch(`${endpoints.reports}/${date}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir relatório');
        }

        toast.success('Relatório excluído com sucesso!');
        onDelete(date);
      } catch (error) {
        console.error('Erro ao excluir relatório:', error);
        toast.error('Erro ao excluir relatório');
      }
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
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => setSelectedReport(null)}
            className="flex items-center"
          >
            Voltar
          </Button>
        </div>
        <div id="report-content">
          <ReportDisplay readOnly report={selectedReport} />
        </div>
      </div>
    );
  }

  const filteredReports = filterDate
    ? reports.filter(report => report.header.date.includes(filterDate))
    : reports;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios Salvos</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            variant="secondary"
            onClick={loadReports}
            className="flex items-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            {filterDate ? 'Nenhum relatório encontrado para esta data.' : 'Nenhum relatório salvo.'}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredReports.map((report) => (
            <Card key={report.header.date}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(report.header.date).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Supervisor: {report.header.supervisor || 'Não informado'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Unidade: {report.header.unit || 'Não informada'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleView(report)}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(report.header.date)}
                    className="flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Equipamentos</p>
                  <p className="text-xl font-semibold text-gray-900">{report.summary.totalEquipment}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Testados</p>
                  <p className="text-xl font-semibold text-gray-900">{report.summary.testedEquipment}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Limpos</p>
                  <p className="text-xl font-semibold text-gray-900">{report.summary.cleanedEquipment}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">V9</p>
                  <p className="text-xl font-semibold text-gray-900">{report.summary.v9Equipment}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedReports; 