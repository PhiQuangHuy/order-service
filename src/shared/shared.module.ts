// src/shared/shared.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from 'src/order/entities/order.entity';
import { OrderRepository } from 'src/order/repositories/order.repository';
import { OrderService } from 'src/order/services/order.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderService, OrderRepository, KafkaProducerService],
  exports: [OrderService, KafkaProducerService, TypeOrmModule],
})
export class SharedModule {}
