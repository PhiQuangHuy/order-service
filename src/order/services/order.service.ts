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
import { Order, OrderStatus } from '../entities/order.entity';
import { KafkaProducerService } from '../../kafka/kafka-producer.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Validate order items
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Create order
    const order = await this.orderRepository.create(createOrderDto);

    // Publish order created event
    await this.kafkaProducer.publishOrderCreated({
      orderId: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      items: order.items,
      createdAt: order.createdAt,
    });

    return this.mapToResponseDto(order);
  }

  async getAllOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();
    return orders.map((order) => this.mapToResponseDto(order));
  }

  async getOrderById(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.mapToResponseDto(order);
  }

  async getOrdersByCustomerId(customerId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByCustomerId(customerId);
    return orders.map((order) => this.mapToResponseDto(order));
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByStatus(status);
    return orders.map((order) => this.mapToResponseDto(order));
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

    // Publish order updated event if status changed
    if (updateOrderDto.status && updateOrderDto.status !== existingOrder.status) {
      await this.kafkaProducer.publishOrderStatusChanged({
        orderId: id,
        oldStatus: existingOrder!.status,
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
    // Publish status change event
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

    // Only allow deletion if order is pending
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be deleted');
    }

    const deleted = await this.orderRepository.delete(id);
    if (!deleted) {
      throw new BadRequestException('Failed to delete order');
    }

    // Publish order deleted event
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
    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentId: order.paymentId,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
