import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;
}
