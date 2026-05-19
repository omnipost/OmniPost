import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';

// Routes
import authRoutes      from './routes/auth';
import userRoutes      from './routes/users';
import accountRoutes   from './routes/accounts';
import postRoutes      from './routes/posts';
import mediaRoutes     from './routes/media';
import analyticsRoutes from './routes/analytics';
import webhookRoutes   from './routes/webhooks';
import billingRoutes   from './routes/billing';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security middleware ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
});

const publishLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { success: false, error: 'Post rate limit reached. Please wait before publishing more.' },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use('/api/posts/publish', publishLimiter);

// ── General middleware ───────────────────────────────────────────
app.use(compression());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'OmniPost API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:  process.uptime(),
  });
});

// ── API routes ───────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/accounts',  accountRoutes);
app.use('/api/posts',     postRoutes);
app.use('/api/media',     mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks',  webhookRoutes);
app.use('/api/billing',   billingRoutes);

// ── 404 handler ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error:   process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 OmniPost API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
