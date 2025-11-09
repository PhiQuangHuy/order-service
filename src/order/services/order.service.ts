import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { Order, OrderStatus } from '@prisma/client';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';
import { instanceToPlain } from 'class-transformer';
import { OrderItem } from '../interfaces/order-item.interface';
import { GetOrderDto } from '../dtos/get-order.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { PrismaService } from 'src/prisma/services/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly paginationProvider: PaginationProvider,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const order = await this.orderRepository.create(createOrderDto);

    const plainItems = instanceToPlain(createOrderDto.items) as OrderItem[];

    await this.kafkaProducer.publishOrderCreated({
      orderId: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount.toNumber(),
      items: plainItems,
      createdAt: order.createdAt,
    });

    return this.mapToResponseDto(order);
  }

  async getAllOrders(dto: GetOrderDto): Promise<Paginated<OrderResponseDto>> {
    const where: any = {};
    if (dto.status) where.status = dto.status;
    if (dto.customerId) where.customerId = dto.customerId;

    const paginated = await this.paginationProvider.paginateQuery<Order>(
      dto,
      this.prisma.order,
      where,
    );

    // Map to DTO
    const data = paginated.data.map((order) => this.mapToResponseDto(order));

    return { data, meta: paginated.meta };
  }
  
  async getOrderById(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.mapToResponseDto(order);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.orderRepository.update(id, updateOrderDto);
    if (!updatedOrder) {
      throw new InternalServerErrorException(`Failed to update order with ID ${id}`);
    }

    if (updateOrderDto.status && updateOrderDto.status !== existingOrder.status) {
      await this.kafkaProducer.publishOrderStatusChanged({
        orderId: id,
        oldStatus: existingOrder.status,
        newStatus: updateOrderDto.status,
        updatedAt: new Date(),
      });
    }

    return this.mapToResponseDto(updatedOrder);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponseDto> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.orderRepository.updateStatus(id, status);
    if (!updatedOrder) {
      throw new InternalServerErrorException(`Failed to update order with ID ${id}`);
    }

    await this.kafkaProducer.publishOrderStatusChanged({
      orderId: id,
      oldStatus: existingOrder.status,
      newStatus: status,
      updatedAt: new Date(),
    });

    return this.mapToResponseDto(updatedOrder);
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be deleted');
    }

    const deleted = await this.orderRepository.delete(id);
    if (!deleted) {
      throw new BadRequestException('Failed to delete order');
    }

    await this.kafkaProducer.publishOrderDeleted({
      orderId: id,
      customerId: order.customerId,
      deletedAt: new Date(),
    });
  }

  async handlePaymentProcessed(
    orderId: string,
    paymentId: string,
    success: boolean,
  ): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (success) {
      await this.orderRepository.setPaymentId(orderId, paymentId);
      await this.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
    } else {
      await this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
  }

  private mapToResponseDto(order: Order): OrderResponseDto {
    const items: OrderItem[] = Array.isArray(order.items)
      ? (order.items as unknown as OrderItem[])
      : [];

    return {
      id: order.id,
      customerId: order.customerId,
      items,
      totalAmount: order.totalAmount.toNumber(),
      status: order.status,
      paymentId: order.paymentId ?? undefined,
      shippingAddress: order.shippingAddress ?? undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}