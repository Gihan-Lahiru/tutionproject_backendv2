import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsString()
  grade: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
