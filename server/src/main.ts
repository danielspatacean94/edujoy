import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { validationMessages } from './common/dto/validation-messages';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(new Logger());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: errors => new BadRequestException(validationMessages(errors)),
  }));
  app.use(
    helmet({
      // Ant Design injects <style> tags at runtime (CSS-in-JS) and the SPA
      // needs to load its own bundled scripts/styles — helmet's default CSP
      // would block both under the stock 'self'-only policy. Leave CSP off
      // here rather than ship a policy nobody tuned; the other headers
      // (X-Frame-Options, X-Content-Type-Options, HSTS, etc.) still apply.
      // Configure a real Content-Security-Policy before production.
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`, 'Bootstrap');
}
bootstrap();
