import { Assignment } from './assignment.entity';
import { User } from './user.entity';
export declare class Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    fileUrl?: string;
    remarks?: string;
    marks?: number;
    submittedAt: Date;
    assignment: Assignment;
    student: User;
}
//# sourceMappingURL=submission.entity.d.ts.map