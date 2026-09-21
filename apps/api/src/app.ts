import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { roleRouter } from './routes/role.routes.js';
import { permissionRouter } from './routes/permission.routes.js';
import { productRouter } from './routes/product.routes.js';
import { priceRouter } from './routes/price.routes.js';
import { billingRouter } from './routes/billing.routes.js';
import { customerRouter } from './routes/customer.routes.js';
import { pisaiRouter } from './routes/pisai.routes.js';
import { expenseRouter } from './routes/expense.routes.js';
import { returnRouter } from './routes/return.routes.js';
import { reportRouter } from './routes/report.routes.js';
import { closingRouter } from './routes/closing.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): Express => {
  const app = express();

  // Security & Logging Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1') ||
          origin === process.env.CORS_ORIGIN
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Base API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/roles', roleRouter);
  app.use('/api/permissions', permissionRouter);
  app.use('/api/products', productRouter);
  app.use('/api/prices', priceRouter);
  app.use('/api/bills', billingRouter);
  app.use('/api/customers', customerRouter);
  app.use('/api/pisai', pisaiRouter);
  app.use('/api/expenses', expenseRouter);
  app.use('/api/returns', returnRouter);
  app.use('/api/reports', reportRouter);
  app.use('/api/closing', closingRouter);
  app.use('/api/audit-logs', auditRouter);

  // 404 Catch-All
  app.use('*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource does not exist.',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
