import { useState, useEffect } from 'react';
import axios from 'axios';

interface Movement {
  date: string;
  type: string;
  source: string;
  destination: string;
  responsibleUser: string;
  observations: string;
  quantity: number;
}

interface UseMovementsReturn {
  movements: Movement[];
  loading: boolean;
  error: string | null;
  deleteMovement: (date: string) => Promise<void>;
  refreshMovements: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useMovements(): UseMovementsReturn {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/stock/movements`);
      setMovements(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar movimentos');
      console.error('Erro ao carregar movimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovement = async (date: string) => {
    try {
      await axios.delete(`${API_URL}/api/stock/movement/${date}`);
      await fetchMovements(); // Recarrega a lista após excluir
    } catch (err) {
      console.error('Erro ao excluir movimento:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return {
    movements,
    loading,
    error,
    deleteMovement,
    refreshMovements: fetchMovements
  };
} 