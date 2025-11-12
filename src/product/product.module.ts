import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { SharedModule } from 'src/shared/shared.module';
import { ProductService } from './services/product.service';
import { ProductRepository } from './repositories/product.repository';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [SharedModule, PaginationModule],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService],
  exports: [],
})
export class ProductModule {}
