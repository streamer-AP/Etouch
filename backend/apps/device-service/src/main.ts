import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DeviceServiceModule } from './device-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DeviceServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.DEVICE_SERVICE_HOST || '0.0.0.0',
        port: parseInt(process.env.DEVICE_SERVICE_PORT, 10) || 3003,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen();
  console.log('📱 Device Service is running on port 3003');
}

bootstrap();