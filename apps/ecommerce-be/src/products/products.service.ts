import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async getProductByCategory(category: string) {
    return this.prisma.products.findMany({
      where: { product_categories: { is: { name: category } } },
    });
  }

  async getProductByType(type: string) {
    return this.prisma.products.findMany({
      where: { product_types: { is: { name: type } } },
    });
  }

  async getProductsByTypeAndCategory(type: string, category: string) {
    return this.prisma.products.findMany({
      where: {
        product_types: { is: { name: type } },
        product_categories: { is: { name: category } },
      },
    });
  }

  async getProductById(id: string) {
    return this.prisma.products.findUnique({
      where: { id: id },
    });
  }

  async getAllProducts() {
    return this.prisma.products.findMany();
  }
}
