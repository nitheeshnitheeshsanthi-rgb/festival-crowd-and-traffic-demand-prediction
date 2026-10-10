import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRoute } from './server/apiHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route middleware
app.use('/api', async (req, res, next) => {
  const handled = await handleApiRoute(req, res);
  if (!handled) {
    next();
  }
});

// Serve static frontend build
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FestivalFlow AI server running on port ${PORT}`);
});
