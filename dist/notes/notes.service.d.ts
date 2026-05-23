import { Repository } from 'typeorm';
import { Note } from '../database/entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UploadService } from '../common/services/upload.service';
import { Notification } from '../database/entities/notification.entity';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
export declare class NotesService {
    private noteRepository;
    private uploadService;
    private notificationRepository;
    private classRepository;
    private userRepository;
    constructor(noteRepository: Repository<Note>, uploadService: UploadService, notificationRepository: Repository<Notification>, classRepository: Repository<Class>, userRepository: Repository<User>);
    create(createNoteDto: CreateNoteDto, file: any, classId: string): Promise<Note>;
    findByClass(classId: string): Promise<Note[]>;
    findAll(): Promise<Note[]>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notes.service.d.ts.map