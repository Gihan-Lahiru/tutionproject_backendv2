import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Controller('api/assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Post(':classId')
  async create(
    @Param('classId') classId: string,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(createAssignmentDto, classId);
  }

  @Get('class/:classId')
  async findByClass(@Param('classId') classId: string) {
    return this.assignmentsService.findByClass(classId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.assignmentsService.findById(id);
  }

  @Post(':id/submit')
  async submit(
    @Param('id') assignmentId: string,
    @Body() submitDto: SubmitAssignmentDto,
    @Req() req: Request,
  ) {
    return this.assignmentsService.submit(assignmentId, (req.user as any).id, submitDto);
  }

  @Put(':submissionId/grade')
  async grade(
    @Param('submissionId') submissionId: string,
    @Body() gradeDto: { marks: number; remarks: string },
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      gradeDto.marks,
      gradeDto.remarks,
    );
  }

  @Get(':assignmentId/submissions')
  async getSubmissions(@Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.getSubmissionsByAssignment(assignmentId);
  }
}
