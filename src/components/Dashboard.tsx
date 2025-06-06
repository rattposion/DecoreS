import React, { useState, useEffect } from 'react';
import { useReports } from '../hooks/useReports';

const Dashboard: React.FC = () => {
  const { dashboardData, loading, error } = useReports();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('agora');

  useEffect(() => {
    // Atualiza o timestamp quando novos dados chegam
    if (dashboardData) {
      setLastUpdate(new Date());
    }

    // Atualiza o texto "há X segundos" a cada segundo
    const intervalId = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
      if (seconds < 60) {
        setTimeAgo(seconds === 0 ? 'agora' : `há ${seconds} segundos`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dashboardData, lastUpdate]);

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

  if (!dashboardData) {
    return (
      <div className="p-4 text-gray-600 bg-gray-100 rounded-md">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Dashboard - Resumo do Dia
          </h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-500">
              Atualizado {timeAgo}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900">Equipamentos</h4>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Total Testados</p>
              <p className="text-2xl font-semibold text-blue-900">{dashboardData.totalTested}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Total V9</p>
              <p className="text-2xl font-semibold text-blue-900">{dashboardData.totalV9}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-green-900">Aprovação</h4>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600">Total Aprovados</p>
              <p className="text-2xl font-semibold text-green-900">{dashboardData.totalApproved}</p>
            </div>
            <div>
              <p className="text-sm text-green-600">Taxa de Aprovação</p>
              <p className="text-2xl font-semibold text-green-900">
                {(dashboardData.approvalRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-red-900">Rejeição</h4>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-red-600">Total Rejeitados</p>
              <p className="text-2xl font-semibold text-red-900">{dashboardData.totalRejected}</p>
            </div>
            <div>
              <p className="text-sm text-red-600">Taxa de Rejeição</p>
              <p className="text-2xl font-semibold text-red-900">
                {(dashboardData.rejectionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-purple-900">Limpeza</h4>
          <div className="mt-2">
            <p className="text-sm text-purple-600">Total Limpos</p>
            <p className="text-2xl font-semibold text-purple-900">{dashboardData.totalCleaned}</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium text-yellow-900">Reset</h4>
          <div className="mt-2">
            <p className="text-sm text-yellow-600">Total Resetados</p>
            <p className="text-2xl font-semibold text-yellow-900">{dashboardData.totalResetados}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 