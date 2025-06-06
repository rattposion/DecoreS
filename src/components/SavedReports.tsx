import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Trash2 } from 'lucide-react';
import { useReportData } from '../hooks/useReportData';
import Button from './Button';
import Card from './Card';
import ReportDisplay from './ReportDisplay';
import toast from 'react-hot-toast';
import { endpoints } from '../config/api';
import { format } from 'date-fns';
import { useReports } from '../hooks/useReports';
import { Report } from '../../../backend/src/types/report';

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
  const { getHistory, setReportData, deleteReport } = useReportData();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const { reports: reportsFromUseReports, loading: loadingFromUseReports, error: errorFromUseReports } = useReports();

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
        await deleteReport(date);
        setReports(reports.filter(report => report.header.date !== date));
        toast.success('Relatório excluído e estoque atualizado com sucesso!');
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

  if (errorFromUseReports) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        {errorFromUseReports}
      </div>
    );
  }

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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Relatórios Salvos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turno
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Testados
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Aprovação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report: Report) => (
                  <tr key={report.header.date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(report.header.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.header.supervisor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.header.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.header.shift === 'morning' ? 'Manhã' : 'Tarde'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.dashboardData.totalTested}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(report.dashboardData.approvalRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleView(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(report.header.date)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedReports; 