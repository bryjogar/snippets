import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware, checkAuthEnv } from './auth.js';
import { connectDB } from './db.js';
import snippetsRouter from './routes/snippets.js';

async function main() {
  checkAuthEnv();
  await connectDB();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(authMiddleware);

  // API routes
  app.use('/api/snippets', snippetsRouter);

  // SPA fallback + static
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDir = path.join(__dirname, 'client');
  app.use(express.static(clientDir));
  app.get('*', (_req: any, res: any) => {
    res.sendFile('index.html', { root: clientDir });
  });

  const port = parseInt(process.env.PORT || '3008');
  app.listen(port, () => {
    console.log(`Snippets running on port ${port}`);
  });
}

main().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
