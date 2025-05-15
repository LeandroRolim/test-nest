import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, Order as PrismaOrder } from '@prisma/client';
import { OrderProductEntity } from './order-product.entity';

export class OrderEntity implements Omit<PrismaOrder, 'status'> {
  @ApiProperty({ example: 'c3d4e5f6-g7h8-9012-3456-7890abcdef01', description: 'The unique identifier of the order' })
  id: string;

  @ApiProperty({ type: [OrderProductEntity], description: 'List of products included in the order' })
  products: OrderProductEntity[]; // Use a entidade OrderProductEntity

  @ApiProperty({ example: 2401.98, type: Number, description: 'Total value of the order' })
  order_total: number;

  @ApiProperty({ example: OrderStatus.PENDING, enum: OrderStatus, description: 'Current status of the order' })
  status: OrderStatus; // Use o enum diretamente

  @ApiProperty({ example: '2023-01-17T14:00:00.000Z', description: 'Timestamp of when the order was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-17T14:05:00.000Z', description: 'Timestamp of when the order was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}