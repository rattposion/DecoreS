const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'decore';

let client;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
async function connectToMongoDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Rotas do estoque
app.get('/api/stock', async (req, res) => {
  try {
    const collection = client.db(DB_NAME).collection('stock');
    const stock = await collection.findOne({ type: 'stock' });
    res.json(stock || {
      type: 'stock',
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
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

app.put('/api/stock', async (req, res) => {
  try {
    const collection = client.db(DB_NAME).collection('stock');
    await collection.updateOne(
      { type: 'stock' },
      { $set: { ...req.body, type: 'stock' } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
});

app.post('/api/stock/movement', async (req, res) => {
  try {
    const collection = client.db(DB_NAME).collection('stock');
    const stock = await collection.findOne({ type: 'stock' });
    
    const movement = {
      ...req.body,
      date: new Date().toISOString()
    };

    const modelKey = movement.model === 'ZTE 670 V1' ? 'v1' : 'v9';
    const quantity = movement.type === 'ENTRADA' ? movement.quantity : -movement.quantity;

    const newStock = {
      ...stock,
      items: {
        ...stock.items,
        [modelKey]: {
          ...stock.items[modelKey],
          quantity: stock.items[modelKey].quantity + quantity,
          lastUpdate: new Date().toISOString()
        }
      },
      movements: [movement, ...(stock.movements || [])]
    };

    await collection.updateOne(
      { type: 'stock' },
      { $set: newStock },
      { upsert: true }
    );

    res.json(newStock);
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    res.status(500).json({ error: 'Erro ao registrar movimentação' });
  }
});

app.get('/api/stock/movements', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const collection = client.db(DB_NAME).collection('stock');
    const stock = await collection.findOne({ type: 'stock' });
    
    let movements = stock?.movements || [];
    
    if (startDate) {
      movements = movements.filter(m => m.date >= startDate);
    }
    if (endDate) {
      movements = movements.filter(m => m.date <= endDate);
    }

    res.json(movements);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
});

// Iniciar servidor
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}); 