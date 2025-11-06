// // src/order/order.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Order } from './entities/order.entity';
// import { OrderController } from './controllers/order.controller';
// import { OrderService } from './services/order.service';
// import { OrderRepository } from './repositories/order.repository';
// import { SharedModule } from 'src/shared/shared.module';

// @Module({
//   imports: [TypeOrmModule.forFeature([Order]), SharedModule],
//   controllers: [OrderController],
//   providers: [OrderService, OrderRepository],
//   exports: [OrderService],
// })
// export class OrderModule {}

// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), SharedModule],
  controllers: [OrderController],
  providers: [OrderRepository],
  exports: [],
})
export class OrderModule {}
