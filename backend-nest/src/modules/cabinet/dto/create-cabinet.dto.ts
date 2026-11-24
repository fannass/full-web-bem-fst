import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCabinetDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'period_id harus berupa angka' })
  @IsNotEmpty({ message: 'Periode harus dipilih' })
  period_id: number;

  @IsString({ message: 'Nama kabinet harus berupa teks' })
  @IsNotEmpty({ message: 'Nama kabinet wajib diisi' })
  name: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCabinetDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'period_id harus berupa angka' })
  @IsOptional()
  period_id?: number;

  @IsString({ message: 'Nama kabinet harus berupa teks' })
  @IsNotEmpty({ message: 'Nama kabinet tidak boleh kosong' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
