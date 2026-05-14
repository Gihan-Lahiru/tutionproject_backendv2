import { Class } from './class.entity';
import { Assignment } from './assignment.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    profilePicture?: string;
    tuitionClass?: string;
    status: string;
    currentSessionId?: string;
    createdAt: Date;
    updatedAt: Date;
    teacherClasses: Class[];
    assignments: Assignment[];
}
//# sourceMappingURL=user.entity.d.ts.map