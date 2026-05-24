import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { PdfWatermarkService } from '../common/services/pdf-watermark.service';

@Controller('api/assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(
    private assignmentsService: AssignmentsService,
    private pdfWatermarkService: PdfWatermarkService
  ) {}

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

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const assignment = await this.assignmentsService.findById(id);
    if (!assignment || !assignment.attachmentUrl) {
      throw new NotFoundException('Assignment file not found');
    }

    const filename = `Assignment_${assignment.title.replace(/\s+/g, '_')}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    const isPdf = assignment.attachmentUrl.toLowerCase().includes('.pdf');

    if (isPdf) {
      const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(
        assignment.attachmentUrl,
        req.user.name,
        req.user.grade
      );
      
      if (watermarkedBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', watermarkedBuffer.length);
        return res.send(watermarkedBuffer);
      }
    }

    return res.redirect(assignment.attachmentUrl);
  }
}
