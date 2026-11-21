import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ReelPlaceFinder API',
  });
});

// Serve frontend in production build if dist folder exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA routing in Express 5, serve index.html for any remaining GET requests
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.json({
        message: 'Reel Place Finder API running. Start the Vite dev server with "npm run client" for frontend development.',
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Reel Place Finder Server listening on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔑 Gemini Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`===============================================`);
});
