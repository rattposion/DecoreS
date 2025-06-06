export interface StockItem {
  model: 'ZTE 670 V1' | 'ZTE 670 V9';
  quantity: number;
  lastUpdate: string;
  status: 'DISPONÍVEL' | 'RESERVADO' | 'EM_MANUTENÇÃO';
}

export interface StockMovement {
  model: 'ZTE 670 V1' | 'ZTE 670 V9';
  quantity: number;
  date: string;
  type: 'ENTRADA' | 'SAÍDA';
  responsibleUser: string;
  destination?: string;
  source?: string;
  observations?: string;
}

export interface StockData {
  items: {
    v1: StockItem;
    v9: StockItem;
  };
  movements: StockMovement[];
} 