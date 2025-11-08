import { OrderItem } from '../interfaces/order-item.interface';
import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentId?: string;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}
