import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCompanyDataDto {
  @IsString()
  companyName: string;

  @IsInt()
  @Min(1)
  numberOfUsers: number;

  @IsInt()
  @Min(1)
  numberOfProducts: number;
}

export class UpdateCompanyDataDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfUsers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfProducts?: number;
}
