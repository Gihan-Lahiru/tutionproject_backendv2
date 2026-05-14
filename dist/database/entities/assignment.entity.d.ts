import { Class } from './class.entity';
import { Submission } from './submission.entity';
import { User } from './user.entity';
export declare class Assignment {
    id: string;
    classId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    attachmentUrl?: string;
    createdAt: Date;
    class: Class;
    submissions: Submission[];
    createdBy: User;
}
//# sourceMappingURL=assignment.entity.d.ts.map