import { Class } from './class.entity';
import { User } from './user.entity';
export declare class Note {
    id: string;
    title: string;
    classId?: string;
    fileUrl?: string;
    fileType?: string;
    uploadedBy?: string;
    uploadedAt: Date;
    createdAt: Date;
    class: Class;
    uploader: User;
}
//# sourceMappingURL=note.entity.d.ts.map