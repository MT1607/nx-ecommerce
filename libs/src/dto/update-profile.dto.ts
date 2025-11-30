import { IsDateString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  address?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;
}
