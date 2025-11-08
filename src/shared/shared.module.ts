import { Module } from '@nestjs/common';
import { OrderRepository } from 'src/order/repositories/order.repository';
import { OrderService } from 'src/order/services/order.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { PrismaService } from 'src/prisma/services/prisma.service';

@Module({
  providers: [OrderService, OrderRepository, KafkaProducerService, PrismaService],
  exports: [OrderService, KafkaProducerService, PrismaService],
})
export class SharedModule {}
