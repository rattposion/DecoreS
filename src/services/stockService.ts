import { StockData, StockMovement } from '../types/stock';
import { endpoints } from '../config/api';

const STOCK_KEY = 'decore_stock';

const initialStock: StockData = {
  items: {
    v1: {
      model: 'ZTE 670 V1',
      quantity: 0,
      lastUpdate: new Date().toISOString(),
      status: 'DISPONÍVEL'
    },
    v9: {
      model: 'ZTE 670 V9',
      quantity: 0,
      lastUpdate: new Date().toISOString(),
      status: 'DISPONÍVEL'
    }
  },
  movements: []
};

export const stockService = {
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
      
      const stock = await response.json();
      localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
      return stock;
    } catch (error) {
      console.error('Erro ao buscar da API, usando localStorage:', error);
      const savedStock = localStorage.getItem(STOCK_KEY);
      if (savedStock) {
        return JSON.parse(savedStock);
      }
      return initialStock;
    }
  },

  async updateStock(stock: StockData): Promise<void> {
    try {
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

      localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
    } catch (error) {
      console.error('Erro ao atualizar na API:', error);
      localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
      throw error;
    }
  },

  async addMovement(movement: StockMovement): Promise<StockData> {
    try {
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

      const updatedStock = await response.json();
      localStorage.setItem(STOCK_KEY, JSON.stringify(updatedStock));
      return updatedStock;
    } catch (error) {
      console.error('Erro ao adicionar movimento:', error);
      throw error;
    }
  },

  async getMovements(startDate?: string, endDate?: string): Promise<StockMovement[]> {
    try {
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
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  },

  async addEntry(movement: Omit<StockMovement, 'date' | 'type'>): Promise<StockData> {
    try {
      // Tentar adicionar via API
      const newStock = await this.addMovement({
        ...movement,
        date: new Date().toISOString(),
        type: 'entry'
      });
      // Atualizar localStorage
      localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));
      return newStock;
    } catch (error) {
      console.error('Erro ao adicionar entrada via API, usando localStorage:', error);
      // Se falhar, usar localStorage
      const stock = await this.getStock();
      const newMovement: StockMovement = {
        ...movement,
        date: new Date().toISOString(),
        type: 'entry'
      };

      const modelKey = movement.model === 'ZTE 670 V1' ? 'v1' : 'v9';
      const newStock = {
        ...stock,
        items: {
          ...stock.items,
          [modelKey]: {
            ...stock.items[modelKey],
            quantity: stock.items[modelKey].quantity + movement.quantity,
            lastUpdate: new Date().toISOString()
          }
        },
        movements: [newMovement, ...stock.movements]
      };

      await this.updateStock(newStock);
      return newStock;
    }
  },

  async removeFromStock(movement: Omit<StockMovement, 'date' | 'type'>): Promise<StockData> {
    try {
      // Tentar remover via API
      const newStock = await this.addMovement({
        ...movement,
        date: new Date().toISOString(),
        type: 'exit'
      });
      // Atualizar localStorage
      localStorage.setItem(STOCK_KEY, JSON.stringify(newStock));
      return newStock;
    } catch (error) {
      console.error('Erro ao remover via API, usando localStorage:', error);
      // Se falhar, usar localStorage
      const stock = await this.getStock();
      const modelKey = movement.model === 'ZTE 670 V1' ? 'v1' : 'v9';

      if (movement.quantity > stock.items[modelKey].quantity) {
        throw new Error('Quantidade insuficiente em estoque');
      }

      const newMovement: StockMovement = {
        ...movement,
        date: new Date().toISOString(),
        type: 'exit'
      };

      const newStock = {
        ...stock,
        items: {
          ...stock.items,
          [modelKey]: {
            ...stock.items[modelKey],
            quantity: stock.items[modelKey].quantity - movement.quantity,
            lastUpdate: new Date().toISOString()
          }
        },
        movements: [newMovement, ...stock.movements]
      };

      await this.updateStock(newStock);
      return newStock;
    }
  },

  async updateItemStatus(model: 'v1' | 'v9', status: 'DISPONÍVEL' | 'RESERVADO' | 'EM_MANUTENÇÃO'): Promise<StockData> {
    try {
      const stock = await this.getStock();
      const newStock = {
        ...stock,
        items: {
          ...stock.items,
          [model]: {
            ...stock.items[model],
            status,
            lastUpdate: new Date().toISOString()
          }
        }
      };

      await this.updateStock(newStock);
      return newStock;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }
}; 