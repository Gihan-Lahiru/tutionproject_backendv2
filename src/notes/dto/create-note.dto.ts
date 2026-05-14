import { IsString, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
