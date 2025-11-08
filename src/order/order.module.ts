import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [OrderController],
  providers: [OrderRepository],
  exports: [],
})
export class OrderModule {}
