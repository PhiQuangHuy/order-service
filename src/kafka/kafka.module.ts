// import { forwardRef, Module } from '@nestjs/common';
// import { KafkaProducerService } from './kafka-producer.service';
// import { KafkaConsumerService } from './kafka-consumer.service';
// import { OrderModule } from 'src/order/order.module';

// @Module({
//   imports: [forwardRef(() => OrderModule)],
//   providers: [KafkaProducerService, KafkaConsumerService],
//   exports: [KafkaProducerService, KafkaConsumerService],
// })
// export class KafkaModule {}

// src/kafka/kafka.module.ts
import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
