import Stock from '../models/Stock.js';

// Buscar estoque atual
export const getStock = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      // Se não existir, criar estoque inicial
      const initialStock = new Stock({
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
      });
      await initialStock.save();
      return res.status(200).json(initialStock);
    }
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar estoque
export const updateStock = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      const newStock = new Stock(req.body);
      await newStock.save();
      return res.status(201).json(newStock);
    }
    
    Object.assign(stock, req.body);
    await stock.save();
    res.status(200).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Adicionar movimentação
export const addMovement = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }

    const movement = req.body;
    const modelKey = movement.model === 'ZTE 670 V1' ? 'v1' : 'v9';

    // Verificar se há quantidade suficiente para saída
    if (movement.type === 'SAÍDA' && movement.quantity > stock.items[modelKey].quantity) {
      return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
    }

    // Atualizar quantidade
    stock.items[modelKey].quantity += movement.type === 'ENTRADA' ? movement.quantity : -movement.quantity;
    stock.items[modelKey].lastUpdate = new Date().toISOString();

    // Adicionar movimento ao histórico
    stock.movements.unshift(movement);

    await stock.save();
    res.status(200).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Buscar movimentações
export const getMovements = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }

    let movements = stock.movements;

    // Filtrar por data se necessário
    if (req.query.startDate || req.query.endDate) {
      movements = movements.filter(movement => {
        if (req.query.startDate && movement.date < req.query.startDate) return false;
        if (req.query.endDate && movement.date > req.query.endDate) return false;
        return true;
      });
    }

    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 