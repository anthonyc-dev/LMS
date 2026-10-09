// Force Node.js and node-postgres to use UTC for local dates
process.env.TZ = 'UTC';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOriginEnv = process.env.CORS_ORIGIN;

  if (!corsOriginEnv) {
    throw new Error(
      'CORS_ORIGIN environment variable is not set. Refusing to start.',
    );
  }

  const allowedOrigins = corsOriginEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('CORS allowed origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests such as Postman, curl, mobile apps, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS rejected origin: ${origin}`);

      return callback(new Error('Not allowed by CORS'), false);
    },

    credentials: true,

    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // const corsOrigin =
  //   process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173';
  // app.enableCors({
  //   origin: corsOrigin,
  //   credentials: true,
  // });

  // app.enableCors({
  //   origin: 'https://cs-lms-2026.vercel.app',
  //   credentials: true,
  // });

  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  if (process.env.NODE_ENV === 'production') {
    const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
        return;
      }
      next();
    };
    app.use(httpsRedirect);
  }

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
