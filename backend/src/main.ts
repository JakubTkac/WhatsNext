import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { httpLoggerMiddleware } from './common/middleware/http-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
  const frontendUrls = configService
    .getOrThrow<string>('FRONTEND_URL')
    .split(',')
    .map((url) => url.trim());

  app.setGlobalPrefix('api');
  app.use(httpLoggerMiddleware);
  app.use(json({ limit: '512kb' }));
  app.use(urlencoded({ extended: true, limit: '512kb' }));
  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });
  app.use(helmet({ contentSecurityPolicy: false }));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('WhatsNext API')
    .setDescription('OpenAPI documentation for the WhatsNext backend.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs/openapi.json',
  });

  await app.listen(
    Number(configService.get<string>('PORT', '8080')),
    '0.0.0.0',
  );
}

void bootstrap();
