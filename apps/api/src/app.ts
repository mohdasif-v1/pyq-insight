import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { openApiSpec } from './docs/openapi.js';

import authRoutes from './routes/auth.routes.js';
import catalogueRoutes from './routes/catalogue.routes.js';
import paperRoutes from './routes/paper.routes.js';
import { analyticsRouter, studyPlanRouter, progressRouter } from './routes/academic.routes.js';
import reviewRoutes from './routes/review.routes.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middlewares
  app.use(helmet());
  app.use(cors({
    origin: config.clientOrigin,
    credentials: true,
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser(config.cookieSecret));

  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Health and Readiness
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'pyq-insight-api'
    });
  });

  // Mount API Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', catalogueRoutes);
  app.use('/api/v1/papers', paperRoutes);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/study-plans', studyPlanRouter);
  app.use('/api/v1/progress', progressRouter);
  app.use('/api/v1', reviewRoutes);

  // Centralized Error Handling
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error Middleware]:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}
