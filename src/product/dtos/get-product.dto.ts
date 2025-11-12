import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { IntersectionType } from '@nestjs/mapped-types';
import { ProductStatus } from '@prisma/client';

export class GetProductQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

export class GetProductDto extends IntersectionType(
  GetProductQueryDto,
  PaginationQueryDto,
) {}
