import { Body, Controller, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from '@ecommerce/libs';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @MessagePattern({ cmd: 'update_profile' })
  async updateProfile(
    @Payload() payload: { user_id: string; profileData: UpdateProfileDto }
  ) {
    const { user_id, profileData } = payload;
    return this.profilesService.updateProfile({ user_id, profileData });
  }
}
