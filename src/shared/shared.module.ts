import { Module } from '@nestjs/common';
import { OrderRepository } from 'src/order/repositories/order.repository';
import { OrderService } from 'src/order/services/order.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Module({
  providers: [OrderService, OrderRepository, KafkaProducerService, PrismaService, PaginationProvider],
  exports: [OrderService, KafkaProducerService, PrismaService],
})
export class SharedModule {}
