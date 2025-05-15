import { IsString, IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderProductDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'ID of the product to include in the order' })
  productId: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  @ApiProperty({ example: 2, description: 'Quantity of the product for this order', minimum: 1 })
  quantity: number;
}
