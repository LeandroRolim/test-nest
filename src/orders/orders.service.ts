import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, Product, OrderStatus, OrderProduct } from '@prisma/client';
import { OrderEntity } from './entities/order.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { OrderProductEntity } from './entities/order-product.entity';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const { products: productItems } = createOrderDto;
    const productIds = productItems.map((p) => p.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException(
        'Duplicate product IDs found in the order.',
      );
    }

    try {
      const createdOrder = await this.prisma.$transaction(async (tx) => {
        let calculatedOrderTotal = 0;
        const productsToUpdateStock: Array<{ id: string; newStock: number }> =
          [];
        const orderProductDetails: Array<Omit<OrderProduct, 'id' | 'orderId'>> =
          [];
        for (const item of productItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundException(
              `Product with ID "${item.productId}" not found.`,
            );
          }
          if (product.stock_quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product "${product.name}" (ID: ${item.productId}). Available: ${product.stock_quantity}, Requested: ${item.quantity}.`,
            );
          }

          calculatedOrderTotal += product.price * item.quantity;
          productsToUpdateStock.push({
            id: product.id,
            newStock: product.stock_quantity - item.quantity,
          });
          orderProductDetails.push({
            productId: product.id,
            quantity: item.quantity,
          });
        }

        const newOrder = await tx.order.create({
          data: {
            order_total: calculatedOrderTotal,
            status: OrderStatus.PENDING,
          },
        });

        const createdOrderProductsData = [];
        for (const detail of orderProductDetails) {
          const op = await tx.orderProduct.create({
            data: {
              orderId: newOrder.id,
              productId: detail.productId,
              quantity: detail.quantity,
            },
          });
          createdOrderProductsData.push(op);
        }
        const fullOrderDetails = await tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            products: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!fullOrderDetails) {
          throw new InternalServerErrorException(
            'Failed to retrieve order details after creation.',
          );
        }
        return fullOrderDetails;
      });
      return this.mapPrismaOrderToOrderEntity(createdOrder);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating order:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the order.',
      );
    }
  }

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Listar os mais recentes primeiro
      },
    });
    return orders.map((order) => this.mapPrismaOrderToOrderEntity(order));
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    return this.mapPrismaOrderToOrderEntity(order);
  }

  // Método auxiliar para mapear o objeto Order do Prisma para OrderEntity
  private mapPrismaOrderToOrderEntity(order: Order): OrderEntity {
    return new OrderEntity({
      ...order,
      products:
        order.products?.map(
          (op: OrderProduct) =>
            new OrderProductEntity({
              id: op.id,
              quantity: op.quantity,
              product: op.product ? new ProductEntity(op.product) : undefined,
            }),
        ) ?? [],
    });
  }

  // TODO: Implementar métodos para atualizar o status do pedido (ex: completeOrder, cancelOrder)
  // completeOrder(orderId: string) deveria atualizar o estoque.
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderEntity> {
    // Encontrar o pedido
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { products: { include: { product: true } } }, // Incluir produtos para atualização de estoque
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Order with ID "${orderId}" is already ${order.status.toLowerCase()} and cannot be changed.`,
      );
    }

    if (status === OrderStatus.COMPLETED) {
      await this.prisma.$transaction(async (tx) => {
        for (const orderProduct of order.products) {
          const currentProduct = orderProduct.product;
          if (currentProduct.stock_quantity < orderProduct.quantity) {
            throw new BadRequestException(
              `Cannot complete order. Insufficient stock for product "${currentProduct.name}" (ID: ${currentProduct.id}). Available: ${currentProduct.stock_quantity}, In order: ${orderProduct.quantity}.`,
            );
          }
          await tx.product.update({
            where: { id: currentProduct.id },
            data: {
              stock_quantity:
                currentProduct.stock_quantity - orderProduct.quantity,
            },
          });
        }

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status },
          include: { products: { include: { product: true } } },
        });
        return this.mapPrismaOrderToOrderEntity(updatedOrder);
      });
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { products: { include: { product: true } } },
    });
    return this.mapPrismaOrderToOrderEntity(updatedOrder);
  }
}
