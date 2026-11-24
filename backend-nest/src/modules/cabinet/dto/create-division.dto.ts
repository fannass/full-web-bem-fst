import { IsString, IsOptional, IsInt, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateDivisionDto {
  @IsNumber()
  @Min(1)
  cabinet_id: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(5000)
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
