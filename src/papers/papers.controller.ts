import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PapersService } from './papers.service';

@Controller('api/papers')
@UseGuards(AuthGuard('jwt'))
export class PapersController {
  constructor(private papersService: PapersService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body() uploadDto: { title: string; grade: string },
  ) {
    return this.papersService.upload(file, uploadDto.title, uploadDto.grade);
  }

  @Get()
  async findAll() {
    return this.papersService.findAll();
  }

  @Get('grade/:grade')
  async findByGrade(@Param('grade') grade: string) {
    return this.papersService.findByGrade(grade);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.papersService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.papersService.delete(id);
  }
}
