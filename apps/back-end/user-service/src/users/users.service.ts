import { Injectable } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateUserDto, User } from '@ecommerce/libs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}

  @MessagePattern({ cmd: 'create_user' })
  async create(createUserDto: CreateUserDto) {
    try {
      const { first_name, last_name, email, password, type } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.usersRepository.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        type: type,
      } as DeepPartial<User>);
      return await this.usersRepository.save(user);
    } catch (error: any) {
      throw new RpcException(error.message || 'Error creating user');
    }
  }

  @MessagePattern({ cmd: 'get_users' })
  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find();
    console.log('Users fetched:', users);
    const response = users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
    return response;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
