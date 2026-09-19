import 'dotenv/config';
import { createApp } from './app.js';
import { prisma } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify DB connection on startup
    await prisma.$connect();
    console.log('✓ Database connection established');

    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log(`✓ FlourERP API running on http://localhost:${PORT}`);
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
