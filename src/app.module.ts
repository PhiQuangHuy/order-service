import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    OrderModule,
    ProductModule,
    KafkaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
