import { ProductStatus } from "@prisma/client";

export class ProductResponseDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}
