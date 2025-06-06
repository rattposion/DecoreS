import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StockData, StockItem, StockMovement } from '../types/stock';
import { stockService } from '../services/stockService';
import toast from 'react-hot-toast';

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

interface StockContextType {
  stock: StockData;
  addEntry: (movement: Omit<StockMovement, 'date' | 'type'>) => Promise<void>;
  removeFromStock: (movement: Omit<StockMovement, 'date' | 'type'>) => Promise<void>;
  updateItemStatus: (model: 'v1' | 'v9', status: StockItem['status']) => Promise<void>;
  getStockMovements: (startDate?: string, endDate?: string) => Promise<StockMovement[]>;
  loadStock: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stock, setStock] = useState<StockData>(initialStock);

  // Carregar estoque inicial
  const loadStock = useCallback(async () => {
    try {
      const stockData = await stockService.getStock();
      setStock(stockData);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      toast.error('Erro ao carregar dados do estoque');
    }
  }, []);

  // Adicionar entrada ao estoque
  const addEntry = useCallback(async (movement: Omit<StockMovement, 'date' | 'type'>) => {
    try {
      const newStock = await stockService.addEntry(movement);
      setStock(newStock);
      toast.success('Entrada registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar entrada:', error);
      toast.error('Erro ao registrar entrada');
      throw error;
    }
  }, []);

  // Remover do estoque
  const removeFromStock = useCallback(async (movement: Omit<StockMovement, 'date' | 'type'>) => {
    try {
      const newStock = await stockService.removeFromStock(movement);
      setStock(newStock);
      toast.success('Saída registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao remover do estoque:', error);
      toast.error('Erro ao registrar saída');
      throw error;
    }
  }, []);

  // Atualizar status do item
  const updateItemStatus = useCallback(async (model: 'v1' | 'v9', status: StockItem['status']) => {
    try {
      const newStock = await stockService.updateItemStatus(model, status);
      setStock(newStock);
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
      throw error;
    }
  }, []);

  // Buscar movimentações com filtro de data
  const getMovements = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      return await stockService.getMovements(startDate, endDate);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      toast.error('Erro ao buscar movimentações');
      throw error;
    }
  }, []);

  // Carregar estoque inicial
  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const value = {
    stock,
    addEntry,
    removeFromStock,
    updateItemStatus,
    getStockMovements: getMovements,
    loadStock
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}; 
