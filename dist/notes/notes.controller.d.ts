import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
export declare class NotesController {
    private notesService;
    constructor(notesService: NotesService);
    create(classId: string, createNoteDto: CreateNoteDto, file: any): Promise<import("../database/entities/note.entity").Note>;
    findByClass(classId: string): Promise<import("../database/entities/note.entity").Note[]>;
    findAll(): Promise<import("../database/entities/note.entity").Note[]>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notes.controller.d.ts.map