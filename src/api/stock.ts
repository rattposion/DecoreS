import { StockData, StockMovement } from '../types/stock';

// Use a variável de ambiente VITE_API_URL ou a URL do Railway
const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ac65.up.railway.app/api';

export const stockApi = {
  async getStock(): Promise<StockData> {
    try {
      const response = await fetch(`${API_URL}/stock`);
      if (!response.ok) throw new Error('Erro ao buscar estoque');
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async updateStock(stock: StockData): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stock),
      });
      if (!response.ok) throw new Error('Erro ao atualizar estoque');
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async addMovement(movement: StockMovement): Promise<StockData> {
    try {
      const response = await fetch(`${API_URL}/stock/movement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movement),
      });
      if (!response.ok) throw new Error('Erro ao registrar movimentação');
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getMovements(startDate?: string, endDate?: string): Promise<StockMovement[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${API_URL}/stock/movements?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar movimentações');
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }
}; 