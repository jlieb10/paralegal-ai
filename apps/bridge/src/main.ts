import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { BridgeModule } from './bridge.module';

async function bootstrap() {
  const app = await NestFactory.create(BridgeModule);

  // Enable CORS for development
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Paralegal AI Bridge')
      .setDescription('Privacy bridge with redaction and query firewall')
      .setVersion('0.1.0')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT || 8002;
  await app.listen(port);
  
  console.log(`Bridge service listening on port ${port}`);
  console.log(`Privacy mode: PII redaction and policy enforcement active`);
  console.log(`Connected LLM: ${process.env.CONNECTED_LLM_ENABLED === 'true' ? 'Enabled' : 'Disabled (Mock responses)'}`);
}

bootstrap().catch(err => {
  console.error('Failed to start bridge service:', err);
  process.exit(1);
});