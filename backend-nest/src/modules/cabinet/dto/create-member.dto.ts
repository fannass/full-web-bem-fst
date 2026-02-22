import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateCabinetMemberDto {
  @IsNumber()
  division_id: number;

  @IsString()
  name: string;

  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  prodi?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class UpdateCabinetMemberDto {
  @IsNumber()
  @IsOptional()
  division_id?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  prodi?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
