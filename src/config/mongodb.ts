import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'decore';

let client: MongoClient | null = null;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function getReportsCollection() {
  const client = await connectToDatabase();
  const db = client.db(dbName);
  return db.collection('reports');
}

export async function testConnection() {
  try {
    const client = await connectToDatabase();
    await client.db(dbName).command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
} 