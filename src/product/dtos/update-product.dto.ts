import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  MinLength,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
