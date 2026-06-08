import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { json, urlencoded } from 'express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// ================================================================
// Allowed origins — single source of truth used by both NestJS
// enableCors() and the manual CORS fallback in the Vercel handler.
// ================================================================
const ALLOWED_ORIGINS = [
  'https://www.learnwithmaleesha.com',
  'https://learnwithmaleesha.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
];

// ================================================================
// Module-level cache — bootstrap() is called only once per cold
// start. Subsequent warm requests reuse the same Express instance.
// ================================================================
let appCache: NestExpressApplication | null = null;
let bootstrapPromise: Promise<NestExpressApplication> | null = null;

async function bootstrap(): Promise<NestExpressApplication> {
  const isProduction = process.env.NODE_ENV === 'production';

  const corsOptions: CorsOptions = {
    // In production only allow listed origins; in dev allow all.
    origin: isProduction ? ALLOWED_ORIGINS : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS must be enabled FIRST — before any other middleware so that
  // error responses from later middleware still carry CORS headers.
  app.enableCors(corsOptions);

  console.log('[CORS] Configuration:', JSON.stringify({
    origin: corsOptions.origin,
    credentials: corsOptions.credentials,
    methods: corsOptions.methods,
    isProduction,
  }));

  // Request logger (visible in Vercel Function Logs)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, _res: any, next: any) => {
    console.log(
      `[REQ] ${req.method} ${req.path} Origin: ${req.headers.origin || 'none'}`,
    );
    next();
  });

  // Body parsers
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

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tuition Sir API')
    .setDescription('Learning Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Development-only debug route
  if (!isProduction) {
    try {
      const { NotificationsService } = await import('./notifications/notifications.service');
      let notificationsService: any = null;
      try {
        notificationsService = app.get(NotificationsService);
      } catch { /* service may not be available */ }

      if (expressApp && notificationsService) {
        expressApp.post('/__debug/notify', async (req: any, res: any) => {
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
    } catch (err: any) {
      console.warn('Failed to register debug notify route', err?.message || err);
    }
  }

  if (process.env.VERCEL) {
    // Vercel serverless: initialise without starting an HTTP listener
    await app.init();
  } else {
    // Local development: bind to a port
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
  }

  return app;
}

// ================================================================
// VERCEL SERVERLESS HANDLER
//
// Key design decisions:
//
//  1. CORS headers are injected BEFORE bootstrap so that even if
//     the app crashes during startup the browser still receives a
//     CORS-compliant error response (no "blocked by CORS" overlay).
//
//  2. OPTIONS preflight is short-circuited without booting the app.
//     This makes cold-start preflights near-instant.
//
//  3. A single shared Promise (bootstrapPromise) prevents parallel
//     cold-starts from spawning multiple NestJS instances when
//     several requests arrive simultaneously on a cold container.
//
//  4. The resolved app is stored in appCache so warm requests skip
//     bootstrap entirely.
// ================================================================
function injectCorsHeaders(req: any, res: any): void {
  const origin: string | undefined = req.headers?.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.setHeader('Vary', 'Origin');
  }
}

export = async function handler(req: any, res: any) {
  // Step 1: Inject CORS headers unconditionally — ensures CORS is
  // present even if the function throws before NestJS middleware runs.
  injectCorsHeaders(req, res);

  // Step 2: Short-circuit OPTIONS preflight without booting the app.
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Step 3: Bootstrap (or reuse cached instance).
  try {
    if (!appCache) {
      if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
      }
      appCache = await bootstrapPromise;
    }

    const expressInstance = appCache.getHttpAdapter().getInstance();
    return expressInstance(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler] Fatal error:', err?.message || err, err?.stack);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error during startup',
        timestamp: new Date().toISOString(),
      });
    }
  }
};