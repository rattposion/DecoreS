import express from 'express';
import cors from 'cors';
import { connectToDatabase, getReportsCollection } from '../server/mongodb.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configurar CORS para permitir apenas origens específicas em produção
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://decore-frontend.vercel.app', 'http://localhost:3000']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota de healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Função para obter a coleção de estoque
async function getStockCollection() {
  const client = await connectToDatabase();
  const db = client.db("decore_db");
  return db.collection('stock');
}

// Test connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ status: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Rotas de Estoque
app.get('/api/stock', async (req, res) => {
  try {
    const collection = await getStockCollection();
    const stock = await collection.findOne();
    if (!stock) {
      // Se não existir, criar estoque inicial
      const initialStock = {
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
      await collection.insertOne(initialStock);
      res.json(initialStock);
    } else {
      res.json(stock);
    }
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

app.put('/api/stock', async (req, res) => {
  try {
    const collection = await getStockCollection();
    const stock = await collection.findOne();
    if (!stock) {
      const result = await collection.insertOne(req.body);
      res.json(result);
    } else {
      const result = await collection.updateOne(
        { _id: stock._id },
        { $set: req.body }
      );
      res.json(result);
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

app.post('/api/stock/movement', async (req, res) => {
  try {
    const collection = await getStockCollection();
    const stock = await collection.findOne();
    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    const movement = req.body;
    const modelKey = movement.model === 'ZTE 670 V1' ? 'v1' : 'v9';

    // Verificar se há quantidade suficiente para saída
    if (movement.type === 'SAÍDA' && movement.quantity > stock.items[modelKey].quantity) {
      res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
      return;
    }

    // Atualizar quantidade
    stock.items[modelKey].quantity += movement.type === 'ENTRADA' ? movement.quantity : -movement.quantity;
    stock.items[modelKey].lastUpdate = new Date().toISOString();

    // Adicionar movimento ao histórico
    stock.movements.unshift(movement);

    const result = await collection.updateOne(
      { _id: stock._id },
      { 
        $set: {
          items: stock.items,
          movements: stock.movements
        }
      }
    );

    res.json(stock);
  } catch (error) {
    console.error('Error adding movement:', error);
    res.status(500).json({ error: 'Failed to add movement' });
  }
});

app.get('/api/stock/movements', async (req, res) => {
  try {
    const collection = await getStockCollection();
    const stock = await collection.findOne();
    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
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

    res.json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

// Rotas de Relatórios
app.get('/api/reports', async (req, res) => {
  try {
    const collection = await getReportsCollection();
    const reports = await collection.find({}).toArray();
    console.log('Reports fetched successfully:', reports.length);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const collection = await getReportsCollection();
    const result = await collection.insertOne(req.body);
    console.log('Report saved successfully:', result.insertedId);
    res.json(result);
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

app.put('/api/reports/:date', async (req, res) => {
  try {
    const collection = await getReportsCollection();
    const result = await collection.updateOne(
      { 'header.date': req.params.date },
      { $set: req.body },
      { upsert: true }
    );
    console.log('Report updated successfully:', req.params.date);
    res.json(result);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

app.get('/api/reports/:date', async (req, res) => {
  try {
    const collection = await getReportsCollection();
    const report = await collection.findOne({ 'header.date': req.params.date });
    if (!report) {
      console.log('Report not found:', req.params.date);
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    console.log('Report fetched successfully:', req.params.date);
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Rota para excluir relatório
app.delete('/api/reports/:date', async (req, res) => {
  try {
    // Buscar o relatório antes de excluir
    const reportsCollection = await getReportsCollection();
    const report = await reportsCollection.findOne({ 'header.date': req.params.date });
    
    if (!report) {
      console.log('Report not found for deletion:', req.params.date);
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    // Calcular totais de equipamentos do relatório
    const morningTotal = {
      v1: report.morning.reduce((sum, c) => sum + (c.tested || 0), 0),
      v9: report.morning.reduce((sum, c) => sum + (c.v9 || 0), 0)
    };
    
    const afternoonTotal = {
      v1: report.afternoon.reduce((sum, c) => sum + (c.tested || 0), 0),
      v9: report.afternoon.reduce((sum, c) => sum + (c.v9 || 0), 0)
    };

    const totalV1 = morningTotal.v1 + afternoonTotal.v1;
    const totalV9 = morningTotal.v9 + afternoonTotal.v9;

    // Atualizar o estoque
    const stockCollection = await getStockCollection();
    const stock = await stockCollection.findOne();

    if (stock) {
      // Remover os equipamentos do estoque
      if (totalV1 > 0) {
        stock.items.v1.quantity -= totalV1;
        stock.movements.unshift({
          model: 'ZTE 670 V1',
          quantity: totalV1,
          date: new Date().toISOString(),
          type: 'SAÍDA',
          responsibleUser: 'Sistema',
          observations: `Saída automática por exclusão do relatório de ${new Date(req.params.date).toLocaleDateString()}`
        });
      }

      if (totalV9 > 0) {
        stock.items.v9.quantity -= totalV9;
        stock.movements.unshift({
          model: 'ZTE 670 V9',
          quantity: totalV9,
          date: new Date().toISOString(),
          type: 'SAÍDA',
          responsibleUser: 'Sistema',
          observations: `Saída automática por exclusão do relatório de ${new Date(req.params.date).toLocaleDateString()}`
        });
      }

      // Atualizar o estoque no banco de dados
      await stockCollection.updateOne(
        { _id: stock._id },
        { 
          $set: {
            items: stock.items,
            movements: stock.movements
          }
        }
      );
    }

    // Excluir o relatório
    const result = await reportsCollection.deleteOne({ 'header.date': req.params.date });
    
    console.log('Report and related stock movements deleted successfully:', req.params.date);
    res.json({ 
      message: 'Report and related stock movements deleted successfully',
      stockUpdated: !!stock
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar servidor com tratamento de erro
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode`);
  console.log(`Server URL: ${process.env.NODE_ENV === 'production' ? process.env.RAILWAY_STATIC_URL : `http://localhost:${port}`}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try another port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 