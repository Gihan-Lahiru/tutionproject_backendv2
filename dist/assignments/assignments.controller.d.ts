import { Request } from 'express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
export declare class AssignmentsController {
    private assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    create(classId: string, createAssignmentDto: CreateAssignmentDto): Promise<import("../database/entities/assignment.entity").Assignment>;
    findByClass(classId: string): Promise<import("../database/entities/assignment.entity").Assignment[]>;
    findById(id: string): Promise<import("../database/entities/assignment.entity").Assignment>;
    submit(assignmentId: string, submitDto: SubmitAssignmentDto, req: Request): Promise<import("../database/entities/submission.entity").Submission>;
    grade(submissionId: string, gradeDto: {
        marks: number;
        remarks: string;
    }): Promise<import("../database/entities/submission.entity").Submission>;
    getSubmissions(assignmentId: string): Promise<import("../database/entities/submission.entity").Submission[]>;
}
//# sourceMappingURL=assignments.controller.d.ts.map