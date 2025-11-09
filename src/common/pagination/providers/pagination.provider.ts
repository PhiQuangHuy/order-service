import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationProvider {
  public async paginateQuery<T>(
    paginationQuery: PaginationQueryDto,
    prismaDelegate: any, // e.g. prisma.order
    where?: any,         // optional dynamic filter
  ): Promise<Paginated<T>> {
    const limit = paginationQuery.limit ?? 10;
    const page = paginationQuery.page ?? 1;
    const skip = (page - 1) * limit;

    const [results, totalItems] = await Promise.all([
      prismaDelegate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // optional default sort
      }),
      prismaDelegate.count({ where }),
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