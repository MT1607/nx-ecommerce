import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateUserDto, User } from '@ecommerce/libs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
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
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find();
    console.log('Users fetched:', users);
    const response = users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
    return response;
  }
}
