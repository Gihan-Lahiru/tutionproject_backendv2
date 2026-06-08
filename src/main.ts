import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { json, urlencoded } from 'express';

export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ========================
  // CRITICAL: CORS Configuration
  // ========================
  // On Vercel serverless, the raw Express instance handles requests directly.
  // NestJS's enableCors() configures the Express cors middleware on the adapter,
  // which is correct. But we must ensure:
  // 1. OPTIONS preflight requests are explicitly handled
  // 2. All allowed headers/methods are listed
  // 3. credentials: true requires specific Access-Control-Allow-Origin (not '*')
  // 4. The origin MUST match exactly what the browser sends (with or without trailing slash, www vs non-www)
  app.enableCors({
    origin: function (origin, callback) {
      // In production, only allow specific origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
        'https://www.learnwithmaleesha.com',
        'https://learnwithmaleesha.com',
      ];
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Log rejected origins for debugging
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Forwarded-For',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ========================
  // IMPORTANT: Global OPTIONS handler for preflight requests
  // While enableCors() handles most OPTIONS via the cors middleware,
  // on Vercel serverless, we add an explicit global OPTIONS route
  // as a safety net to ensure preflight requests never fall through.
  // ========================
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.options('*', (req, res) => {
    res.status(204).send('');
  });

  // Allow moderately sized JSON bodies for thumbnail payloads
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve uploaded files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tuition Sir API')
    .setDescription('Learning Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Development-only debug route
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { NotificationsService } = await import('./notifications/notifications.service');
      let notificationsService: any = null;
      try {
        notificationsService = app.get(NotificationsService);
      } catch {}

      if (expressApp && notificationsService) {
        expressApp.post('/__debug/notify', async (req, res) => {
          try {
            const { userId, type = 'debug', message = 'Test notification from debug endpoint' } = req.body || {};
            if (!userId) return res.status(400).json({ message: 'userId is required' });
            const note = await notificationsService.create({ userId, type, message, read: 0 });
            return res.json({ notification: note });
          } catch (err) {
            console.error('Debug notify error', err);
            return res.status(500).json({ message: 'failed' });
          }
        });
      }
    } catch (err) {
      console.warn('Failed to register debug notify route', err?.message || err);
    }
  }

  await app.init();
  return app;
}

// ========================
// VERCEL SERVERLESS: Bootstrap wrapper for serverless
// Vercel calls this exported function for each request.
// On Vercel, do NOT call app.listen() - instead,
// Vercel provides the HTTP context via the handler export.
// ========================
let cachedApp: NestExpressApplication | null = null;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  return cachedApp;
}

// Export for Vercel serverless function
// Vercel's @vercel/node runtime can handle Express apps
export default async function handler(req: any, res: any) {
  const app = await getApp();
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
}

// Local development: start the server
async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

// Only bootstrap if NOT in Vercel serverless environment
if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}