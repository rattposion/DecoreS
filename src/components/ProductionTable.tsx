import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import Button from './Button';
import { Collaborator } from '../hooks/useReportData';

interface ProductionTableProps {
  title: string;
  collaborators: Collaborator[];
  onUpdate: (index: number, field: keyof Collaborator, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ProductionTable: React.FC<ProductionTableProps> = ({
  title,
  collaborators = [],
  onUpdate,
  onAdd,
  onRemove
}) => {
  // Calcular totais com verificação de array
  const totals = Array.isArray(collaborators) ? collaborators.reduce(
    (acc, curr) => ({
      tested: acc.tested + (curr.tested || 0),
      cleaned: acc.cleaned + (curr.cleaned || 0),
      resetados: acc.resetados + (curr.resetados || 0),
      v9: acc.v9 + (curr.v9 || 0)
    }),
    { tested: 0, cleaned: 0, resetados: 0, v9: 0 }
  ) : { tested: 0, cleaned: 0, resetados: 0, v9: 0 };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button variant="secondary" onClick={onAdd} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Colaborador
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Colaborador
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center">
                  <Package className="w-4 h-4 mr-1 text-blue-500" />
                  670L V1
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Limpos
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resetados
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-center">
                  <Package className="w-4 h-4 mr-1 text-purple-500" />
                  670L V9
                </div>
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(collaborators) && collaborators.map((collaborator, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={collaborator.name || ''}
                    onChange={(e) => onUpdate(index, 'name', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nome do colaborador"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="0"
                    value={collaborator.tested || 0}
                    onChange={(e) => onUpdate(index, 'tested', parseInt(e.target.value) || 0)}
                    className="w-20 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="0"
                    value={collaborator.cleaned || 0}
                    onChange={(e) => onUpdate(index, 'cleaned', parseInt(e.target.value) || 0)}
                    className="w-20 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="0"
                    value={collaborator.resetados || 0}
                    onChange={(e) => onUpdate(index, 'resetados', parseInt(e.target.value) || 0)}
                    className="w-20 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="0"
                    value={collaborator.v9 || 0}
                    onChange={(e) => onUpdate(index, 'v9', parseInt(e.target.value) || 0)}
                    className="w-20 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Linha de totais */}
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-3 text-gray-700">Total</td>
              <td className="px-4 py-3 text-center text-blue-600">{totals.tested}</td>
              <td className="px-4 py-3 text-center text-gray-700">{totals.cleaned}</td>
              <td className="px-4 py-3 text-center text-gray-700">{totals.resetados}</td>
              <td className="px-4 py-3 text-center text-purple-600">{totals.v9}</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div className="flex items-center">
          <Package className="w-4 h-4 mr-1 text-blue-500" />
          <span>670L V1: Equipamentos que serão adicionados ao estoque</span>
        </div>
        <div className="flex items-center">
          <Package className="w-4 h-4 mr-1 text-purple-500" />
          <span>670L V9: Equipamentos que serão adicionados ao estoque</span>
        </div>
      </div>
    </div>
  );
};

export default ProductionTable;