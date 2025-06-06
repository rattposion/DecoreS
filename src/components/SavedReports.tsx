import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { useReportData } from '../hooks/useReportData';
import Button from './Button';
import Card from './Card';
import ReportDisplay from './ReportDisplay';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Report } from '../../../backend/src/types/report';

const SavedReports: React.FC = () => {
  const { getHistory, setReportData, deleteReport } = useReportData();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [deletingReport, setDeletingReport] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const history = await getHistory();
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
    setReportData(report);
  };

  const handleDelete = async (date: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingReport(date);
    try {
      await deleteReport(date);
      await loadReports(); // Recarrega a lista após excluir
      toast.success('Relatório excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      toast.error('Erro ao excluir relatório');
    } finally {
      setDeletingReport(null);
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
        <ReportDisplay readOnly report={selectedReport} onBack={() => setSelectedReport(null)} />
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

      {reports.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            {filterDate ? 'Nenhum relatório encontrado para esta data.' : 'Nenhum relatório salvo.'}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report.header.date}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(new Date(report.header.date), 'dd/MM/yyyy')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Supervisor: {report.header.supervisor}
                  </p>
                  <p className="text-sm text-gray-500">
                    Unidade: {report.header.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Turno: {report.header.shift === 'morning' ? 'Manhã' : 'Tarde'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleView(report)}
                    className="flex items-center"
                    title="Visualizar relatório"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(report.header.date)}
                    className="flex items-center"
                    disabled={deletingReport === report.header.date}
                    title="Excluir relatório"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Testados</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {report.summary?.totalTested || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total V9</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {report.summary?.totalV9 || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Colaboradores</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {report.summary?.totalCollaborators || 0}
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

export default SavedReports; 
