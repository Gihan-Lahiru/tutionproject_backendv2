import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'https://www.learnwithmaleesha.com',
      'https://learnwithmaleesha.com',
    ],
    credentials: true,
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

  const port = process.env.PORT || 5000;
  // Development-only debug route: create a notification directly
  if (process.env.NODE_ENV !== 'production') {
    try {
      const expressApp = app.getHttpAdapter().getInstance();
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

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
