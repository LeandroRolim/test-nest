import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { OrdersModule } from './orders/orders.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule, ProductsModule, OrdersModule],
  controllers: [AppController, ProductsController, OrdersController],
  providers: [AppService, ProductsService, OrdersService],
})
export class AppModule {}
