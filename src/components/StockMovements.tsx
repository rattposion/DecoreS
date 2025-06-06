import React from 'react';
import { useMovements } from '../hooks/useMovements';
import MovementsList from './MovementsList';

const StockMovements: React.FC = () => {
  const { movements, loading, error, deleteMovement } = useMovements();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Últimos Movimentos
        </h3>
      </div>
      <MovementsList movements={movements} onDelete={deleteMovement} />
    </div>
  );
};

export default StockMovements; 