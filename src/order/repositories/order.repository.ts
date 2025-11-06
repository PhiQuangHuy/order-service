import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = this.orderRepository.create({
      ...createOrderDto,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    return await this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return await this.orderRepository.findOne({ where: { id } });
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order | null> {
    await this.orderRepository.update(id, updateOrderDto);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    if (!result.affected) {
      throw new InternalServerErrorException(`Failed to update order with ID ${id}`);
    }
    return result.affected > 0;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.orderRepository.update(id, { status });
    return await this.findById(id);
  }

  async setPaymentId(id: string, paymentId: string): Promise<Order | null> {
    await this.orderRepository.update(id, { paymentId });
    return await this.findById(id);
  }
}
