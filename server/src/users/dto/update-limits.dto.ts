import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateLimitsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  dailyLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyLimit?: number;
}
