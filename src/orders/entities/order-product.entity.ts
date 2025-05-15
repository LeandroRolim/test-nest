import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from '../../products/entities/product.entity';

export class OrderProductEntity {
  @ApiProperty({ example: 'b2c3d4e5-f6g7-8901-2345-67890abcdef0', description: 'Unique identifier for the order-product link' })
  id: string;
  
  @ApiProperty({ type: () => ProductEntity, description: 'Details of the product in the order' })
  product: ProductEntity; // Detalhes do produto

  @ApiProperty({ example: 2, description: 'Quantity of this product in the order' })
  quantity: number;
  constructor(partial: Partial<OrderProductEntity>) {
    Object.assign(this, partial);
  }
}
