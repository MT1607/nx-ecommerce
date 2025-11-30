import {
  PublicProfilesInterface,
  type CreateUserDto,
  type PublicUserInterface,
  type UpdateProfileDto,
} from '@ecommerce/libs';
import {
  Injectable,
  Inject,
  Body,
  InternalServerErrorException,
  Param,
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

  updateProfile(
    @Param('user_id') userId: string,
    @Body() profileData: UpdateProfileDto
  ) {
    return this.userClient.send(
      { cmd: 'update_profile' },
      { user_id: userId, profileData: profileData }
    );
  }

  getProfile(@Param('user_id') userId: string) {
    return this.userClient.send<PublicProfilesInterface>(
      { cmd: 'get_profile' },
      userId
    );
  }
}
