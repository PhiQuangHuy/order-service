import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { Prisma, Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const plainItems = instanceToPlain(createOrderDto.items);

    return this.prisma.order.create({
      data: {
        customerId: createOrderDto.customerId,
        items: plainItems, // JSON field
        totalAmount,
        status: 'PENDING',
        shippingAddress: createOrderDto.shippingAddress,
      },
    });
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
  const data: Prisma.OrderUpdateInput = {};

    if (updateOrderDto.status !== undefined) {
      data.status = { set: updateOrderDto.status! };
    }
    if (updateOrderDto.paymentId !== undefined) {
      data.paymentId = updateOrderDto.paymentId;
    }
    if (updateOrderDto.shippingAddress !== undefined) {
      data.shippingAddress = updateOrderDto.shippingAddress;
    }

    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.order.delete({
      where: { id },
    });
    return true;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async setPaymentId(id: string, paymentId: string): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { paymentId },
    });
  }
}