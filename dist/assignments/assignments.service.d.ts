import { Repository } from 'typeorm';
import { Assignment } from '../database/entities/assignment.entity';
import { Submission } from '../database/entities/submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
export declare class AssignmentsService {
    private assignmentRepository;
    private submissionRepository;
    constructor(assignmentRepository: Repository<Assignment>, submissionRepository: Repository<Submission>);
    create(createAssignmentDto: CreateAssignmentDto, classId: string): Promise<Assignment>;
    findByClass(classId: string): Promise<Assignment[]>;
    findById(id: string): Promise<Assignment>;
    submit(assignmentId: string, studentId: string, submitDto: SubmitAssignmentDto): Promise<Submission>;
    gradeSubmission(submissionId: string, marks: number, remarks: string): Promise<Submission>;
    getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
}
//# sourceMappingURL=assignments.service.d.ts.map