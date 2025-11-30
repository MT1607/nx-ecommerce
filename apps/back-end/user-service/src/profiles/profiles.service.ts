import {
  Profile,
  PublicProfilesInterface,
  UpdateProfileDto,
} from '@ecommerce/libs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Payload, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>
  ) {}

  async updateProfile(
    @Payload() payload: { user_id: string; profileData: UpdateProfileDto }
  ): Promise<Profile> {
    const { user_id, profileData: updateProfileDto } = payload;
    const userToUpdate = await this.profilesRepository.findOneBy({ user_id });

    if (!userToUpdate) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Profile with user_id ${user_id} not found`,
      });
    }

    Object.assign(userToUpdate, {
      address: updateProfileDto.address,
      phone: updateProfileDto.phone,
      date_of_birth: updateProfileDto.date_of_birth,
    });
    console.log('object assign: ', userToUpdate);

    return this.profilesRepository.save(userToUpdate);
  }

  async getProfile(user_id: string): Promise<PublicProfilesInterface> {
    console.log('Getting profile for user_id: ', user_id);
    const profile = await this.profilesRepository.findOneBy({ user_id });

    if (!profile) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Profile with user_id ${user_id} not found`,
      });
    }

    return profile;
  }
}
