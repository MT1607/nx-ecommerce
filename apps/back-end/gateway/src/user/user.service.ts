import type { CreateUserDto, PublicUserInterface } from '@ecommerce/libs';
import {
  Injectable,
  Inject,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy
  ) {}

  getUsers() {
    return this.userClient.send<PublicUserInterface[], string>(
      { cmd: 'get_users' },
      ''
    );
  }

  createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userClient.send({ cmd: 'create_user' }, createUserDto);
    } catch (error) {
      throw new InternalServerErrorException('Could not create users');
    }
  }
}
