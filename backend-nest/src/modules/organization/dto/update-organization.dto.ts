import { IsEmail, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsObject()
  social_media?: Record<string, string>;
}
