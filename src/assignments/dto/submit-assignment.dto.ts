import { IsString, IsOptional } from 'class-validator';

export class SubmitAssignmentDto {
  @IsString()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
