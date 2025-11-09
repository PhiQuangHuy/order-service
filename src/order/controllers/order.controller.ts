import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { OrderStatus } from '@prisma/client'
import { GetOrderDto } from '../dtos/get-order.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return await this.orderService.createOrder(createOrderDto);
  }

  @Get()
  async getAllOrders(
    @Query() getOrderDto: GetOrderDto
  ): Promise<Paginated<OrderResponseDto>> {
    return await this.orderService.getAllOrders(getOrderDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.getOrderById(id);
  }

  @Put(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateOrderStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param('id') id: string): Promise<void> {
    await this.orderService.deleteOrder(id);
  }
}
