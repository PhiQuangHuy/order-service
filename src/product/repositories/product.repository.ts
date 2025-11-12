import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        quantity: createProductDto.quantity,
        sku: createProductDto.sku,
      },
    });
  }

  async findAll(where?: Prisma.ProductWhereInput): Promise<Product[]> {
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { sku },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const data: Prisma.ProductUpdateInput = {};

    if (updateProductDto.name !== undefined) {
      data.name = updateProductDto.name;
    }
    if (updateProductDto.description !== undefined) {
      data.description = updateProductDto.description;
    }
    if (updateProductDto.price !== undefined) {
      data.price = updateProductDto.price;
    }
    if (updateProductDto.quantity !== undefined) {
      data.quantity = updateProductDto.quantity;
    }
    if (updateProductDto.sku !== undefined) {
      data.sku = updateProductDto.sku;
    }
    if (updateProductDto.status !== undefined) {
      data.status = updateProductDto.status;
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return this.prisma.product.count({ where });
  }
}
