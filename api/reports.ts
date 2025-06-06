import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://decore:Wesley26.@decore.xvhk00w.mongodb.net/decore_db?retryWrites=true&w=majority";
let cachedDb: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client;
  return client;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const { method, query, body } = request;
    const client = await connectToDatabase();
    const collection = client.db('decore_db').collection('relatorios');

    switch (method) {
      case 'GET':
        if (query.date) {
          const report = await collection.findOne({ 'header.date': query.date });
          return response.json(report);
        } else {
          const reports = await collection.find({}).toArray();
          return response.json(reports);
        }

      case 'POST':
        const result = await collection.insertOne(body);
        return response.json(result);

      case 'PUT':
        if (!query.date) {
          return response.status(400).json({ error: 'Date is required' });
        }
        const updateResult = await collection.updateOne(
          { 'header.date': query.date },
          { $set: body },
          { upsert: true }
        );
        return response.json(updateResult);

      default:
        response.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return response.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    return response.status(500).json({ error: 'Database error' });
  }
} 