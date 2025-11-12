import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { GetProductDto } from '../dtos/get-product.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productService.createProduct(createProductDto);
  }

  @Get()
  async getAllProducts(
    @Query() getProductDto: GetProductDto,
  ): Promise<Paginated<ProductResponseDto>> {
    return await this.productService.getAllProducts(getProductDto);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productService.getProductById(id);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    await this.productService.deleteProduct(id);
  }
}
