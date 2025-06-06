import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import DataEntryPanel from './components/DataEntryPanel';
import ReportDisplay from './components/ReportDisplay';
import StockSummary from './components/StockSummary';
import SavedReports from './components/SavedReports';
import { useReportData, ReportDataProvider } from './hooks/useReportData';
import { useStock } from './hooks/useStock';
import { FileText, LayoutDashboard, Package } from 'lucide-react';

function App() {
  const [view, setView] = useState<'entry' | 'display' | 'stock' | 'reports'>('display');
  const { getHistory } = useReportData();
  const { loadStock } = useStock();

  useEffect(() => {
    const init = async () => {
      try {
        // Carregar dados
        await Promise.all([
          getHistory(),
          loadStock()
        ]);
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      }
    };

    init();
  }, [getHistory, loadStock]);

  return (
    <ReportDataProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Navbar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <button
                  onClick={() => setView('display')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    view === 'display'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Dashboard
                </button>

                <button
                  onClick={() => setView('stock')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    view === 'stock'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Package className="w-5 h-5 mr-2" />
                  Estoque
                </button>

                <button
                  onClick={() => setView('reports')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    view === 'reports'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Relatórios
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Conteúdo Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === 'entry' && <DataEntryPanel onBack={() => setView('display')} />}
          {view === 'display' && <ReportDisplay onNewReport={() => setView('entry')} />}
          {view === 'stock' && <StockSummary />}
          {view === 'reports' && <SavedReports />}
        </main>
      </div>
    </ReportDataProvider>
  );
}

export default App;