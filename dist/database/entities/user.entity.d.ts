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
    grade?: string;
    phone?: string;
    institute?: string;
    emailVerificationCode?: string;
    emailVerified: boolean;
    status: string;
    currentSessionId?: string;
    createdAt: Date;
    updatedAt: Date;
    teacherClasses: Class[];
    assignments: Assignment[];
}
//# sourceMappingURL=user.entity.d.ts.map