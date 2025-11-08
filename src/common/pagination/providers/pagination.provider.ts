// src/common/pagination/providers/pagination.provider.ts
import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async paginateQuery<T>(
    paginationQuery: PaginationQueryDto,
    prismaDelegate: any, // e.g. prisma.order, prisma.user
    modelName: string,   // e.g. 'order', 'user'
  ): Promise<Paginated<T>> {
    const limit = paginationQuery.limit ?? 10;
    const page = paginationQuery.page ?? 1;
    const skip = (page - 1) * limit;

    const [results, totalItems] = await Promise.all([
      prismaDelegate.findMany({
        skip,
        take: limit,
      }),
      prismaDelegate.count(),
    ]);

    return {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}