import { StockData, StockMovement } from '../types/stock';
import { endpoints } from '../config/api';

export const stockApi = {
  async getStock(): Promise<StockData> {
    try {
      const response = await fetch(endpoints.stock, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar estoque');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async updateStock(stock: StockData): Promise<void> {
    const response = await fetch(endpoints.stock, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stock)
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar estoque');
    }
  },

  async addMovement(movement: StockMovement): Promise<StockData> {
    const response = await fetch(`${endpoints.stock}/movement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(movement)
    });

    if (!response.ok) {
      throw new Error('Falha ao adicionar movimento');
    }

    return await response.json();
  },

  async getMovements(startDate?: string, endDate?: string): Promise<StockMovement[]> {
    let url = `${endpoints.stock}/movements`;
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar movimentações');
    }

    return await response.json();
  }
}; 