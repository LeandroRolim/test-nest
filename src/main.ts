import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Obter o PrismaService da instância da aplicação
  const prismaService = app.get(PrismaService);
  // Habilitar hooks de desligamento para o PrismaService
  // Certifique-se que esta chamada está correta conforme a sua versão do Prisma/NestJS
  await prismaService.enableShutdownHooks(app);

  // Iniciar a aplicação na porta 3000 (ou outra configurada)
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`); // Log para indicar que a aplicação iniciou
}
bootstrap();
