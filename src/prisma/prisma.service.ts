import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Este método é chamado automaticamente quando o módulo é inicializado.
    // Conecta-se ao banco de dados Prisma.
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Este método garante que a conexão com o Prisma seja fechada graciosamente
    // quando a aplicação NestJS for encerrada.
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
