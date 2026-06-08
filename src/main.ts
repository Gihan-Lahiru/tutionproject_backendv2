import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { json, urlencoded } from 'express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ================================================================
  // CORS Configuration
  // ================================================================
  // NOTE: The cors middleware from NestJS enableCors() is applied
  // as Express middleware. It will handle OPTIONS preflight requests
  // automatically. Do NOT register a custom global OPTIONS handler
  // here! That would bypass the cors middleware and return a 204
  // WITHOUT any CORS headers.
  // ================================================================

  const isProduction = process.env.NODE_ENV === 'production';

  const corsOptions: CorsOptions = {
    origin: isProduction
      ? [
          'https://www.learnwithmaleesha.com',
          'https://learnwithmaleesha.com',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:3004',
          'http://localhost:3005',
        ]
      : true,
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

  app.enableCors(corsOptions);

  // Log the CORS config at startup
  console.log('[CORS] Configuration:', JSON.stringify({
    origin: corsOptions.origin,
    credentials: corsOptions.credentials,
    methods: corsOptions.methods,
    isProduction,
  }));

  // ================================================================
  // REQUEST LOGGING (for debugging CORS)
  // Log every incoming request's Origin header and method.
  // This appears in Vercel Function Logs.
  // ================================================================
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const method = req.method;
    console.log(
      `[CORS] ${method} ${req.path} Origin: ${origin || 'none'} Forwarded: ${req.headers['x-forwarded-for'] || 'none'}`,
    );
    next();
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
  if (!isProduction) {
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

  // ================================================================
  // SERVER START
  // ================================================================
  if (process.env.VERCEL) {
    // Vercel serverless: return the Express app for handling
    return app;
  } else {
    // Local development: listen on a port
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
    return app;
  }
}

// ================================================================
// VERCEL SERVERLESS HANDLER
//
// CRITICAL: On Vercel, the bootstrap() function is called once
// per cold start. The Express instance must be cached and reused
// for subsequent warm requests. This handler is exported as a
// default CommonJS export so @vercel/node can invoke it.
// ================================================================
export = async function (req: any, res: any) {
  const app = await bootstrap();
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
};