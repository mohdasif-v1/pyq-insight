import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { backgroundWorker } from './services/worker.service.js';

async function bootstrap() {
  try {
    await connectDatabase(config.mongoUri);

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`[API Server] Running on http://localhost:${config.port}`);
      console.log(`[Swagger Docs] Available on http://localhost:${config.port}/api-docs`);
    });

    // Start single-worker persistent queue
    backgroundWorker.start();

    const shutdown = async () => {
      console.log('\n[API Server] Graceful shutdown initiated...');
      backgroundWorker.stop();
      server.close(() => {
        console.log('[API Server] Closed HTTP connections.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

bootstrap();
