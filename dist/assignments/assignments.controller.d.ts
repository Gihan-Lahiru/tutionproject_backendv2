import { Request, Response } from 'express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { PdfWatermarkService } from '../common/services/pdf-watermark.service';
export declare class AssignmentsController {
    private assignmentsService;
    private pdfWatermarkService;
    constructor(assignmentsService: AssignmentsService, pdfWatermarkService: PdfWatermarkService);
    create(classId: string, createAssignmentDto: CreateAssignmentDto): Promise<import("../database/entities/assignment.entity").Assignment>;
    findByClass(classId: string): Promise<import("../database/entities/assignment.entity").Assignment[]>;
    findById(id: string): Promise<import("../database/entities/assignment.entity").Assignment>;
    submit(assignmentId: string, submitDto: SubmitAssignmentDto, req: Request): Promise<import("../database/entities/submission.entity").Submission>;
    grade(submissionId: string, gradeDto: {
        marks: number;
        remarks: string;
    }): Promise<import("../database/entities/submission.entity").Submission>;
    getSubmissions(assignmentId: string): Promise<import("../database/entities/submission.entity").Submission[]>;
    download(id: string, res: Response, req: any): Promise<void | Response<any, Record<string, any>>>;
}
//# sourceMappingURL=assignments.controller.d.ts.map