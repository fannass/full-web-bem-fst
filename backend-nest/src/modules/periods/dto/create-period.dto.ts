export class CreatePeriodDto {
  name: string;
  year_start: number;
  year_end: number;
  is_active?: boolean;
  description?: string;
}
