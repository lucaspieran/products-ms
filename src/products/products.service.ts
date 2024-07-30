import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.verbose('Connected to the database');
  }

  create(createProduct: CreateProductDto) {
    return this.product.create({
      data: createProduct,
    });
  }

  async findAll({ page = 1, limit = 10 }: PaginationDto) {
    const totalPages = await this.product.count();

    return {
      meta: {
        total: totalPages,
        page,
        lastPage: Math.ceil(totalPages / limit),
      },
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id: Number(id) },
    });
    console.log(product);
    if (!product)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Product with id:${id} not found`,
      });
    return product;
  }

  update() {
    return 'updateProduct';
  }

  remove(id: number) {
    return `removeProduct ${id}`;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: { id: { in: ids } },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'One or more products not found',
      });
    }

    return products;
  }
}
