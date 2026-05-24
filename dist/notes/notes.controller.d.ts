import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { PdfWatermarkService } from '../common/services/pdf-watermark.service';
import { Response } from 'express';
export declare class NotesController {
    private notesService;
    private pdfWatermarkService;
    constructor(notesService: NotesService, pdfWatermarkService: PdfWatermarkService);
    create(classId: string, createNoteDto: CreateNoteDto, file: any): Promise<import("../database/entities/note.entity").Note>;
    findByClass(classId: string): Promise<import("../database/entities/note.entity").Note[]>;
    findAll(): Promise<import("../database/entities/note.entity").Note[]>;
    download(id: string, res: Response, req: any): Promise<void | Response<any, Record<string, any>>>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notes.controller.d.ts.map