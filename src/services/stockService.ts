import { StockData, StockMovement } from '../types/stock';
import { stockApi } from '../api/stock';

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
      // Tentar buscar da API primeiro
      const stock = await stockApi.getStock();
      // Salvar no localStorage como backup
      localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
      return stock;
    } catch (error) {
      console.error('Erro ao buscar da API, usando localStorage:', error);
      // Se falhar, tentar localStorage
      const savedStock = localStorage.getItem(STOCK_KEY);
      if (savedStock) {
        return JSON.parse(savedStock);
      }
      return initialStock;
    }
  },

  async saveStock(stock: StockData): Promise<void> {
    try {
      // Tentar salvar na API primeiro
      await stockApi.updateStock(stock);
      // Salvar no localStorage como backup
      localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
    } catch (error) {
      console.error('Erro ao salvar na API, usando apenas localStorage:', error);
      // Se falhar, salvar apenas no localStorage
      localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
      throw error;
    }
  },

  async addEntry(movement: Omit<StockMovement, 'date' | 'type'>): Promise<StockData> {
    try {
      // Tentar adicionar via API
      const newStock = await stockApi.addMovement({
        ...movement,
        date: new Date().toISOString(),
        type: 'ENTRADA'
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
        type: 'ENTRADA'
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

      await this.saveStock(newStock);
      return newStock;
    }
  },

  async removeFromStock(movement: Omit<StockMovement, 'date' | 'type'>): Promise<StockData> {
    try {
      // Tentar remover via API
      const newStock = await stockApi.addMovement({
        ...movement,
        date: new Date().toISOString(),
        type: 'SAÍDA'
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
        type: 'SAÍDA'
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

      await this.saveStock(newStock);
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

      await this.saveStock(newStock);
      return newStock;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  async getStockMovements(startDate?: string, endDate?: string): Promise<StockMovement[]> {
    try {
      // Tentar buscar da API
      return await stockApi.getMovements(startDate, endDate);
    } catch (error) {
      console.error('Erro ao buscar movimentações da API, usando localStorage:', error);
      // Se falhar, usar localStorage
      const stock = await this.getStock();
      return stock.movements.filter(movement => {
        if (startDate && movement.date < startDate) return false;
        if (endDate && movement.date > endDate) return false;
        return true;
      });
    }
  }
}; 