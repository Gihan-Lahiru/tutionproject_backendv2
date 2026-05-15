import { Repository } from 'typeorm';
import { Assignment } from '../database/entities/assignment.entity';
import { Submission } from '../database/entities/submission.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
export declare class AssignmentsService {
    private assignmentRepository;
    private submissionRepository;
    private classRepository;
    private notificationRepository;
    private userRepository;
    constructor(assignmentRepository: Repository<Assignment>, submissionRepository: Repository<Submission>, classRepository: Repository<Class>, notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    create(createAssignmentDto: CreateAssignmentDto, classId: string): Promise<Assignment>;
    findByClass(classId: string): Promise<Assignment[]>;
    findById(id: string): Promise<Assignment>;
    submit(assignmentId: string, studentId: string, submitDto: SubmitAssignmentDto): Promise<Submission>;
    gradeSubmission(submissionId: string, marks: number, remarks: string): Promise<Submission>;
    getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
}
//# sourceMappingURL=assignments.service.d.ts.map