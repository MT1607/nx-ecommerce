import { CreateUserDto } from '@ecommerce/libs';
import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { lastValueFrom } from 'rxjs';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      await lastValueFrom(this.userService.createUser(createUserDto));
      return { status: 201, message: 'User created successfully' };
    } catch (error: any) {
      throw error.error;
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
    } catch (error: any) {
      throw error.error;
    }
  }
}
