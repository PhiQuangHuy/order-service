import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { OrderService } from '../order/services/order.service';

export interface PaymentProcessedEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  success: boolean;
  processedAt: Date;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly orderService: OrderService) {
    this.kafka = new Kafka({
      clientId: 'order-service-consumer',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'order-service-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: ['payment.processed'] });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;
          const eventData = JSON.parse(message.value.toString());

          switch (topic) {
            case 'payment.processed':
              await this.handlePaymentProcessed(eventData);
              break;
            default:
              console.log(`Unhandled topic: ${topic}`);
          }
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });

    console.log('Kafka consumer connected and listening');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    console.log('Kafka consumer disconnected');
  }

  private async handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    try {
      console.log(`Processing payment event for order ${event.orderId}`);
      await this.orderService.handlePaymentProcessed(event.orderId, event.paymentId, event.success);
      console.log(
        `Payment processed for order ${event.orderId}: ${event.success ? 'SUCCESS' : 'FAILED'}`,
      );
    } catch (error) {
      console.error(`Failed to handle payment processed event:`, error);
    }
  }
}
