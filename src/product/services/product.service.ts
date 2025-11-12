import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { Product, ProductStatus } from '@prisma/client';
import { GetProductDto } from '../dtos/get-product.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly paginationProvider: PaginationProvider,
    private readonly prisma: PrismaService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    // Validate price
    if (createProductDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Validate quantity
    if (createProductDto.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    // Check if SKU already exists
    if (createProductDto.sku) {
      const existingProduct = await this.productRepository.findBySku(
        createProductDto.sku,
      );
      if (existingProduct) {
        throw new ConflictException(
          `Product with SKU ${createProductDto.sku} already exists`,
        );
      }
    }

    const product = await this.productRepository.create(createProductDto);
    return this.mapToResponseDto(product);
  }

  async getAllProducts(
    dto: GetProductDto,
  ): Promise<Paginated<ProductResponseDto>> {
    const where: Prisma.ProductWhereInput = {};

    if (dto.name) {
      where.name = { contains: dto.name };
    }
    if (dto.sku) {
      where.sku = dto.sku;
    }
    if (dto.status) {
      where.status = dto.status;
    }

    const paginated = await this.paginationProvider.paginateQuery<Product>(
      dto,
      this.prisma.product,
      where,
    );

    const data = paginated.data.map((product) =>
      this.mapToResponseDto(product),
    );
    return { data, meta: paginated.meta };
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.mapToResponseDto(product);
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Validate price if provided
    if (updateProductDto.price !== undefined && updateProductDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Validate quantity if provided
    if (
      updateProductDto.quantity !== undefined &&
      updateProductDto.quantity < 0
    ) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    // Check if SKU already exists for another product
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const productWithSku = await this.productRepository.findBySku(
        updateProductDto.sku,
      );
      if (productWithSku && productWithSku.id !== id) {
        throw new ConflictException(
          `Product with SKU ${updateProductDto.sku} already exists`,
        );
      }
    }

    const updatedProduct = await this.productRepository.update(
      id,
      updateProductDto,
    );
    return this.mapToResponseDto(updatedProduct);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.delete(id);
  }

  private mapToResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      price: Number(product.price),
      quantity: product.quantity,
      sku: product.sku ?? undefined,
      status: product.status as ProductStatus,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
