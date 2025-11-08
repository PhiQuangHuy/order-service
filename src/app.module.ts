import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    OrderModule,
    KafkaModule,
  ],
})
export class AppModule {}
