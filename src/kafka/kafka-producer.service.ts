import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  totalAmount: number;
  items: any[];
  createdAt: Date;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: Date;
}

export interface OrderDeletedEvent {
  orderId: string;
  customerId: string;
  deletedAt: Date;
}

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'order-service-producer',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    console.log('Kafka producer disconnected');
  }

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: 'order.created',
        messages: [
          {
            key: event.orderId,
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log(`Published order.created event for order ${event.orderId}`);
    } catch (error) {
      console.error('Failed to publish order.created event:', error);
      throw error;
    }
  }

  async publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: 'order.status.changed',
        messages: [
          {
            key: event.orderId,
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log(`Published order.status.changed event for order ${event.orderId}`);
    } catch (error) {
      console.error('Failed to publish order.status.changed event:', error);
      throw error;
    }
  }

  async publishOrderDeleted(event: OrderDeletedEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: 'order.deleted',
        messages: [
          {
            key: event.orderId,
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log(`Published order.deleted event for order ${event.orderId}`);
    } catch (error) {
      console.error('Failed to publish order.deleted event:', error);
      throw error;
    }
  }
}
