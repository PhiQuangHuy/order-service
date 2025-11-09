import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { IntersectionType } from '@nestjs/swagger';

export class GetOrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class GetOrderDto extends IntersectionType(
  GetOrderQueryDto,
  PaginationQueryDto,
) {}