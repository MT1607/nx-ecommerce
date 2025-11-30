import { Body, Controller, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';

import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDto, DbExceptionFilter } from '@ecommerce/libs';

@Controller('users')
@UseFilters(new DbExceptionFilter())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern({ cmd: 'get_users' })
  findAll() {
    return this.usersService.findAll();
  }
}
