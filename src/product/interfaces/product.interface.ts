import { ProductStatus } from "@prisma/client";

export interface Product {
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
