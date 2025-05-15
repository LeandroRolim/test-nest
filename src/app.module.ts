import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ProductsController } from './products/products.controller';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { ProductsService } from './products/products.service';

@Module({
  imports: [PrismaModule, ProductsModule, OrdersModule],
  controllers: [AppController, ProductsController, OrdersController],
  providers: [AppService, ProductsService, OrdersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
