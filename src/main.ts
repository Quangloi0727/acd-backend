import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createNestWinstonLogger } from 'nest-winston/dist/winston.providers';
import { winstonLoggerOptions } from './providers/logging/logging.service';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { gprcOptions } from './providers/grpc/grpc.options';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: createNestWinstonLogger(winstonLoggerOptions),
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('ACD Backend')
    .setDescription('Auto Chat Distribution')
    .setVersion('1.0')
    .addTag('acd-backend')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // app.connectMicroservice(gprcOptions);
  // await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
