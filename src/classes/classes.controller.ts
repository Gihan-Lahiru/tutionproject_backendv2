import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('api/classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Post()
  async create(@Body() createClassDto: CreateClassDto, @Req() req: Request) {
    return this.classesService.create(createClassDto, (req.user as any).id);
  }

  @Get()
  async findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Req() req,
  ) {
    return this.classesService.update(id, updateClassDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @Req() req) {
    return this.classesService.delete(id, req.user.id);
  }

  @Get(':id/students')
  async getStudents(@Param('id') id: string) {
    return this.classesService.getStudents(id);
  }

  @Post(':id/enroll')
  async enrollStudent(@Param('id') id: string, @Req() req) {
    return this.classesService.enrollStudent(id, req.user.id);
  }
}
