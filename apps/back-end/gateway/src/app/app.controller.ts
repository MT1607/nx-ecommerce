import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../interface/user-service/user.interface';

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  @Get('users')
  getData() {
    return this.client.send<User[], string>({ cmd: 'get_users' }, '');
  }
}
