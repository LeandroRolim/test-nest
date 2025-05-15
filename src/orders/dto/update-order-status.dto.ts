import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.COMPLETED,
    description: 'The new status for the order',
  })
  status: OrderStatus;
}
