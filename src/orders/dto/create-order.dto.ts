import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderProductDto } from './create-order-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateOrderProductDto)
  @ApiProperty({
    description: 'List of products to include in the order',
    type: [CreateOrderProductDto],
    example: [
      { productId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', quantity: 2 },
    ],
  })
  products: CreateOrderProductDto[];
}
