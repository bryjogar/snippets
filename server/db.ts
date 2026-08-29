import { MongoClient, Db, Collection, Document } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<void> {
  const url = process.env.MONGO_URL || 'mongodb://mongodb:27017';
  const dbName = process.env.MONGO_DB || 'snippets';

  client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);

  // Text index with language_override to avoid conflict with 'language' field
  await db.collection('snippets').createIndex(
    { title: 'text', content: 'text', tags: 'text' },
    { default_language: 'none', language_override: 'searchLanguage' }
  );
  await db.collection('snippets').createIndex({ updated: -1 });
  await db.collection('snippets').createIndex({ tags: 1 });
  await db.collection('snippets').createIndex({ language: 1 });

  console.log(`DB connected: ${dbName}`);
}

export function getCollection<T extends Document = Document>(name: string): Collection<T> {
  return db.collection<T>(name);
}

export async function disconnectDB(): Promise<void> {
  await client?.close();
}
