import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getCorsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply CORS configuration
  app.enableCors(getCorsConfig());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to DTO instances
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
