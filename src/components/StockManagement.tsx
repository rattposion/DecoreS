import React, { useState, useEffect } from 'react';
import { useStock } from '../hooks/useStock';
import { Package, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import toast from 'react-hot-toast';
import { ModelType } from '../types/stock';

interface StockEntryFormProps {
  onClose: () => void;
  isEntry?: boolean;
}

const StockEntryForm: React.FC<StockEntryFormProps> = ({ onClose, isEntry = true }) => {
  const { addEntry, removeFromStock } = useStock();
  const [formData, setFormData] = useState<{
    model: ModelType;
    quantity: number;
    source: string;
    destination: string;
    responsibleUser: string;
    observations: string;
  }>({
    model: 'ZTE 670 V1',
    quantity: 0,
    source: '',
    destination: '',
    responsibleUser: '',
    observations: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEntry) {
        await addEntry(formData);
      } else {
        await removeFromStock(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao processar operação:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Modelo</label>
        <select
          value={formData.model}
          onChange={e => setFormData(prev => ({ ...prev, model: e.target.value as any }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="ZTE 670 V1">ZTE 670 V1</option>
          <option value="ZTE 670 V9">ZTE 670 V9</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Quantidade</label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {isEntry ? 'Origem' : 'Destino'}
        </label>
        <input
          type="text"
          value={isEntry ? formData.source : formData.destination}
          onChange={e => setFormData(prev => ({ 
            ...prev, 
            [isEntry ? 'source' : 'destination']: e.target.value 
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Responsável</label>
        <input
          type="text"
          value={formData.responsibleUser}
          onChange={e => setFormData(prev => ({ ...prev, responsibleUser: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observações</label>
        <textarea
          value={formData.observations}
          onChange={e => setFormData(prev => ({ ...prev, observations: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {isEntry ? 'Registrar Entrada' : 'Registrar Saída'}
        </Button>
      </div>
    </form>
  );
};

const StockManagement: React.FC = () => {
  const { stock, updateItemStatus, loadStock } = useStock();
  const [showEntryForm, setShowEntryForm] = useState(false);
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

  const handleStatusUpdate = async (model: 'v1' | 'v9', status: 'DISPONÍVEL' | 'RESERVADO' | 'EM_MANUTENÇÃO') => {
    try {
      await updateItemStatus(model, status);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h2>
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
            variant="success"
            onClick={() => setShowEntryForm(true)}
            className="flex items-center"
          >
            <ArrowDownCircle className="w-5 h-5 mr-2" />
            Registrar Entrada
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
                  Última atualização: {new Date(stock.items.v1.lastUpdate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stock.items.v1.quantity}</div>
              <div className={`text-sm font-medium ${
                stock.items.v1.status === 'DISPONÍVEL' ? 'text-green-600' :
                stock.items.v1.status === 'RESERVADO' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stock.items.v1.status}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={stock.items.v1.status}
              onChange={e => handleStatusUpdate('v1', e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="DISPONÍVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="EM_MANUTENÇÃO">Em Manutenção</option>
            </select>
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
                  Última atualização: {new Date(stock.items.v9.lastUpdate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stock.items.v9.quantity}</div>
              <div className={`text-sm font-medium ${
                stock.items.v9.status === 'DISPONÍVEL' ? 'text-green-600' :
                stock.items.v9.status === 'RESERVADO' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stock.items.v9.status}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={stock.items.v9.status}
              onChange={e => handleStatusUpdate('v9', e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="DISPONÍVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="EM_MANUTENÇÃO">Em Manutenção</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Modal de Entrada */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Registrar Entrada</h3>
            <StockEntryForm onClose={() => setShowEntryForm(false)} isEntry={true} />
          </div>
        </div>
      )}

      {/* Modal de Saída */}
      {showExitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Registrar Saída</h3>
            <StockEntryForm onClose={() => setShowExitForm(false)} isEntry={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement; 