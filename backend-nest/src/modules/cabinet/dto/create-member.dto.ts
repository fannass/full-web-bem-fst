import { IsString, IsOptional, IsInt, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateCabinetMemberDto {
  @IsNumber()
  @Min(1)
  division_id: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  position: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  prodi?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  photo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  instagram?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkedin?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateCabinetMemberDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  division_id?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  position?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  prodi?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  photo?: string;

  @IsString()
  @MaxLength(5000)
  @IsOptional()
  bio?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  instagram?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  linkedin?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
