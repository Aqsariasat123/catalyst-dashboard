import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config, validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

validateEnv();

const app = express();

// Middleware
app.use(helmet());

// CORS configuration - support multiple origins for production
const allowedOrigins = config.frontendUrl.split(',').map(url => url.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Task Dashboard API Server                                ║
║                                                            ║
║   Local:      http://localhost:${config.port}                      ║
║   Network:    http://192.168.100.31:${config.port}                 ║
║   API Docs:   http://localhost:${config.port}/api/docs             ║
║   Mode:       ${config.nodeEnv.padEnd(43)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
