import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import type { FastifyReply } from 'fastify';
import { capitalize } from '@org/libs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('detail/:id')
  async getProductById(
    @Param('id') productId: string,
    @Res() res: FastifyReply
  ) {
    const result = await this.productsService.getProductById(productId);
    return res
      .status(200)
      .send({ message: 'Get product successfully', data: result });
  }

  @Get('/')
  async getAllProducts(
    @Res() res: FastifyReply,
    @Query('type') type?: string,
    @Query('brand') brand?: string
  ) {
    let result;
    let message;
    let typeCapitalizedBrand = capitalize(brand || '');
    // Có cả type và brand
    if (type && brand) {
      result = await this.productsService.getProductsByTypeAndCategory(
        type,
        typeCapitalizedBrand
      );
      message = 'Get products by type and category successfully';
    }
    // Chỉ có type
    else if (type) {
      result = await this.productsService.getProductByType(type);
      message = 'Get products by type successfully';
    }
    // Chỉ có brand
    else if (brand) {
      result = await this.productsService.getProductByCategory(
        typeCapitalizedBrand
      );
      message = 'Get products by category successfully';
    }
    // Không có gì cả - lấy tất cả
    else {
      result = await this.productsService.getAllProducts();
      message = 'Get products successfully';
    }

    return res.status(200).send({ message, data: result });
  }
}
