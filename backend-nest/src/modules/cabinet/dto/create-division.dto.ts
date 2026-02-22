import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateDivisionDto {
  @IsNumber()
  cabinet_id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
