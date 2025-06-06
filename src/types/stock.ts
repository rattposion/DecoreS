export interface StockItem {
  model: 'ZTE 670 V1' | 'ZTE 670 V9';
  quantity: number;
  lastUpdate: string;
  status: 'DISPONÍVEL' | 'RESERVADO' | 'EM_MANUTENÇÃO';
}

export type ModelType = 'ZTE 670 V1' | 'ZTE 670 V9';

export interface StockMovement {
  date: string;
  type: 'entry' | 'exit';
  model: ModelType;
  quantity: number;
  source: string;
  destination: string;
  responsibleUser: string;
  observations: string;
}

export interface StockState {
  'ZTE 670 V1': number;
  'ZTE 670 V9': number;
}

export interface StockData {
  items: {
    v1: StockItem;
    v9: StockItem;
  };
  movements: StockMovement[];
} 