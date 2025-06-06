import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useStock } from '../hooks/useStock';
import Button from './Button';
import toast from 'react-hot-toast';
import { ModelType } from '../types/stock';

const StockExit: React.FC = () => {
  const { stock, removeFromStock } = useStock();
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
      // Verificar se há quantidade suficiente em estoque
      const currentStock = formData.model === 'ZTE 670 V1' ? stock?.items?.v1?.quantity || 0 : stock?.items?.v9?.quantity || 0;
      
      if (formData.quantity > currentStock) {
        toast.error('Quantidade indisponível em estoque');
        return;
      }

      if (!formData.destination.trim() || !formData.responsibleUser.trim()) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await removeFromStock({
        model: formData.model,
        quantity: formData.quantity,
        source: 'ESTOQUE',
        destination: formData.destination,
        responsibleUser: formData.responsibleUser,
        observations: formData.observations
      });

      toast.success('Saída registrada com sucesso!');
      
      // Limpar formulário
      setFormData({
        model: 'ZTE 670 V1',
        quantity: 0,
        source: '',
        destination: '',
        responsibleUser: '',
        observations: ''
      });
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      toast.error('Erro ao registrar saída');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seleção de Modelo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo do Equipamento
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className={`flex items-center p-4 rounded-lg border-2 transition-colors
              ${formData.model === 'ZTE 670 V1' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-200'}`}
            onClick={() => setFormData({ ...formData, model: 'ZTE 670 V1' })}
          >
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-gray-900">ZTE 670 V1</p>
              <p className="text-sm text-gray-500">Disponível: {stock?.items?.v1?.quantity || 0}</p>
            </div>
          </button>

          <button
            type="button"
            className={`flex items-center p-4 rounded-lg border-2 transition-colors
              ${formData.model === 'ZTE 670 V9' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-200'}`}
            onClick={() => setFormData({ ...formData, model: 'ZTE 670 V9' })}
          >
            <Package className="w-5 h-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-gray-900">ZTE 670 V9</p>
              <p className="text-sm text-gray-500">Disponível: {stock?.items?.v9?.quantity || 0}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quantidade */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
          Quantidade
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          max={formData.model === 'ZTE 670 V1' ? stock?.items?.v1?.quantity || 0 : stock?.items?.v9?.quantity || 0}
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Destino */}
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
          Destino *
        </label>
        <input
          type="text"
          id="destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          placeholder="Ex: Unidade São Paulo"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Responsável */}
      <div>
        <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-2">
          Responsável *
        </label>
        <input
          type="text"
          id="responsible"
          value={formData.responsibleUser}
          onChange={(e) => setFormData({ ...formData, responsibleUser: e.target.value })}
          placeholder="Nome do responsável"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
          Observações
        </label>
        <textarea
          id="observations"
          rows={3}
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observações adicionais"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="danger"
          className="w-full"
        >
          Registrar Saída
        </Button>
      </div>
    </form>
  );
};

export default StockExit; 