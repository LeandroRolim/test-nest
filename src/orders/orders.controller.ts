import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity';
import { OrderStatus } from '@prisma/client'; // Importar OrderStatus
import { UpdateOrderStatusDto } from './dto/update-order-status.dto'; // Criar este DTO

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The order has been successfully created.', type: OrderEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request. Invalid data or insufficient stock.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved list of orders.', type: [OrderEntity] })
  async findAll(): Promise<OrderEntity[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved the order.', type: OrderEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderEntity> {
    return this.ordersService.findOne(id);
  }
  
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)', type: String })
  @ApiBody({ description: 'New status for the order', type: UpdateOrderStatusDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order status updated successfully.', type: OrderEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status transition or insufficient stock for completion.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto.status);
  }
}