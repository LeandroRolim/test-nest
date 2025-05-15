import { ApiProperty } from '@nestjs/swagger';
import { Product as PrismaProduct } from '@prisma/client';

export class ProductEntity implements PrismaProduct {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'The unique identifier of the product',
  })
  id: string;

  @ApiProperty({ example: 'Laptop Pro', description: 'Name of the product' })
  name: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'Category of the product',
  })
  category: string;

  @ApiProperty({
    example: 'High-performance laptop for professionals',
    description: 'Detailed description of the product',
  })
  description: string;

  @ApiProperty({
    example: 1200.99,
    type: Number,
    description: 'Price of the product',
  })
  price: number;

  @ApiProperty({
    example: 50,
    type: Number,
    description: 'Available quantity in stock',
  })
  stock_quantity: number;

  @ApiProperty({
    example: '2023-01-15T10:30:00.000Z',
    description: 'Timestamp of when the product was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-16T12:45:00.000Z',
    description: 'Timestamp of when the product was last updated',
  })
  updatedAt: Date;

  // Construtor opcional para facilitar a criação da entidade a partir de um objeto Prisma
  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
