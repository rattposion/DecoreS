import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://decore:Wesley26.@decore.xvhk00w.mongodb.net/decore_db?retryWrites=true&w=majority";
let cachedDb: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await connectToDatabase();
    const db = client.db('decore_db');
    const collection = db.collection('relatorios');

    switch (req.method) {
      case 'GET':
        if (req.query.date) {
          const report = await collection.findOne({ 'header.date': req.query.date });
          return res.json(report);
        } else {
          const reports = await collection.find({}).toArray();
          return res.json(reports);
        }

      case 'POST':
        const result = await collection.insertOne(req.body);
        return res.json(result);

      case 'PUT':
        const updateResult = await collection.updateOne(
          { 'header.date': req.query.date },
          { $set: req.body },
          { upsert: true }
        );
        return res.json(updateResult);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 