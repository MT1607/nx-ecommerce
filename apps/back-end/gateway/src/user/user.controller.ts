import { CreateUserDto } from '@ecommerce/libs';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { lastValueFrom } from 'rxjs';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      await lastValueFrom(this.userService.createUser(createUserDto));
      return { status: 201, message: 'User created successfully' };
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message.includes('duplicate key value')) {
        throw new BadRequestException('Email already exists');
      }
      if (error.message.includes('arguments required')) {
        throw new BadRequestException('Missing required user fields');
      }
      return new InternalServerErrorException('Could not create user');
    }
  }

  @Get('users')
  @HttpCode(200)
  async getUsers() {
    try {
      const usersData = await lastValueFrom(this.userService.getUsers());
      return {
        message: 'Users fetched successfully',
        data: usersData,
        status: 200,
      };
    } catch (error) {
      throw new InternalServerErrorException('Could not fetch users');
    }
  }
}
