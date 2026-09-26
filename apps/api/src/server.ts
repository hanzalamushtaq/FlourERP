import 'dotenv/config';
import { createApp } from './app.js';
import { prisma } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    const app = createApp();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ FlourERP API running on http://0.0.0.0:${PORT}`);
    });

    // Connect to database resiliently
    prisma.$connect()
      .then(() => {
        console.log('✓ Database connection established');
      })
      .catch((err) => {
        console.warn('⚠️ Initial database connect warning (Prisma will auto-reconnect on query):', err.message);
      });

    // Graceful Shutdown
    const shutdown = async () => {
      console.log('\nShutting down API server...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✓ Disconnected from database');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
