import { OrderStatus, OrderItem } from '../entities/order.entity';

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
