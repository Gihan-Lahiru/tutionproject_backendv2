import { Repository } from 'typeorm';
import { Note } from '../database/entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UploadService } from '../common/services/upload.service';
export declare class NotesService {
    private noteRepository;
    private uploadService;
    constructor(noteRepository: Repository<Note>, uploadService: UploadService);
    create(createNoteDto: CreateNoteDto, file: any, classId: string): Promise<Note>;
    findByClass(classId: string): Promise<Note[]>;
    findAll(): Promise<Note[]>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notes.service.d.ts.map