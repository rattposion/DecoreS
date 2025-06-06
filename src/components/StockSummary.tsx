import React, { useState, useEffect } from 'react';
import { Package, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { useStock } from '../hooks/useStock';
import { StockMovement } from '../types/stock';
import Card from './Card';
import Button from './Button';
import StockExit from './StockExit';
import toast from 'react-hot-toast';

interface StockSummaryProps {}

const StockSummary: React.FC<StockSummaryProps> = () => {
  const { stock, loadStock } = useStock();
  const [showExitForm, setShowExitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadStock();
      toast.success('Estoque atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast.error('Erro ao atualizar estoque');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular totais de saída
  const totalExits = stock?.movements?.reduce((acc, movement: StockMovement) => {
    if (movement.type === 'exit') {
      return {
        v1: acc.v1 + (movement.model === 'ZTE 670 V1' ? movement.quantity : 0),
        v9: acc.v9 + (movement.model === 'ZTE 670 V9' ? movement.quantity : 0)
      };
    }
    return acc;
  }, { v1: 0, v9: 0 }) || { v1: 0, v9: 0 };

  // Calcular totais de entrada
  const totalEntries = stock?.movements?.reduce((acc, movement: StockMovement) => {
    if (movement.type === 'entry') {
      return {
        v1: acc.v1 + (movement.model === 'ZTE 670 V1' ? movement.quantity : 0),
        v9: acc.v9 + (movement.model === 'ZTE 670 V9' ? movement.quantity : 0)
      };
    }
    return acc;
  }, { v1: 0, v9: 0 }) || { v1: 0, v9: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Resumo do Estoque</h2>
        <div className="space-x-3 flex items-center">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            className="flex items-center"
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowExitForm(true)}
            className="flex items-center"
          >
            <ArrowUpCircle className="w-5 h-5 mr-2" />
            Registrar Saída
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ZTE 670 V1 */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ZTE 670 V1</h3>
                <p className="text-sm text-gray-500">
                  Última atualização: {stock?.items?.v1?.lastUpdate ? new Date(stock.items.v1.lastUpdate).toLocaleString() : '-'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stock?.items?.v1?.quantity || 0}</div>
              <div className={`text-sm font-medium ${
                stock?.items?.v1?.status === 'DISPONÍVEL' ? 'text-green-600' :
                stock?.items?.v1?.status === 'RESERVADO' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stock?.items?.v1?.status || 'INDISPONÍVEL'}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Entradas</p>
              <div className="flex items-center">
                <ArrowDownCircle className="w-4 h-4 text-green-600 mr-1" />
                <p className="text-2xl font-bold text-green-600">{totalEntries.v1}</p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Saídas</p>
              <div className="flex items-center">
                <ArrowUpCircle className="w-4 h-4 text-red-600 mr-1" />
                <p className="text-2xl font-bold text-red-600">{totalExits.v1}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ZTE 670 V9 */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ZTE 670 V9</h3>
                <p className="text-sm text-gray-500">
                  Última atualização: {stock?.items?.v9?.lastUpdate ? new Date(stock.items.v9.lastUpdate).toLocaleString() : '-'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stock?.items?.v9?.quantity || 0}</div>
              <div className={`text-sm font-medium ${
                stock?.items?.v9?.status === 'DISPONÍVEL' ? 'text-green-600' :
                stock?.items?.v9?.status === 'RESERVADO' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stock?.items?.v9?.status || 'INDISPONÍVEL'}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Entradas</p>
              <div className="flex items-center">
                <ArrowDownCircle className="w-4 h-4 text-green-600 mr-1" />
                <p className="text-2xl font-bold text-green-600">{totalEntries.v9}</p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Saídas</p>
              <div className="flex items-center">
                <ArrowUpCircle className="w-4 h-4 text-red-600 mr-1" />
                <p className="text-2xl font-bold text-red-600">{totalExits.v9}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Últimos Movimentos */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Últimos Movimentos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stock?.movements?.slice(0, 5).map((movement, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(movement.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${movement.type === 'entry' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {movement.type === 'entry' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{movement.model}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{movement.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{movement.responsibleUser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showExitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Registrar Saída</h3>
              <button onClick={() => setShowExitForm(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <StockExit />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSummary; 