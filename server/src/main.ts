import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS') || '';
  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map((o) => o.trim())
    .filter((o) => !!o);

  // Enable CORS restricted to allowed origins from .env
  app.enableCors({
    origin: (origin, callback) => {
      // If no whitelist configured, allow all origins (reflect origin header)
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      // Allow non-browser or same-origin requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS: Origin not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
