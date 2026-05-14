import { User } from './user.entity';
import { Assignment } from './assignment.entity';
import { Note } from './note.entity';
export declare class Class {
    id: string;
    name: string;
    title?: string;
    grade: string;
    subject: string;
    day?: string;
    time?: string;
    fee?: number;
    description?: string;
    location?: string;
    teacherId?: string;
    createdAt: Date;
    updatedAt: Date;
    teacher: User;
    students: User[];
    assignments: Assignment[];
    notes: Note[];
}
//# sourceMappingURL=class.entity.d.ts.map