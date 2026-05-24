import { PapersService } from './papers.service';
import { PdfWatermarkService } from '../common/services/pdf-watermark.service';
import { Response } from 'express';
export declare class PapersController {
    private papersService;
    private pdfWatermarkService;
    constructor(papersService: PapersService, pdfWatermarkService: PdfWatermarkService);
    upload(file: any, uploadDto: {
        title: string;
        grade?: string;
        type?: string;
        topic?: string;
        classId?: string;
    }): Promise<import("../database/entities/paper.entity").Paper>;
    findAll(type?: string): Promise<import("../database/entities/paper.entity").Paper[]>;
    findByGrade(grade: string): Promise<import("../database/entities/paper.entity").Paper[]>;
    findById(id: string): Promise<import("../database/entities/paper.entity").Paper>;
    delete(id: string): Promise<{
        message: string;
    }>;
    incrementDownload(id: string): Promise<{
        downloads: any;
    }>;
    download(id: string, res: Response, req: any): Promise<void | Response<any, Record<string, any>>>;
    file(id: string, res: Response, req: any): Promise<void | Response<any, Record<string, any>>>;
}
//# sourceMappingURL=papers.controller.d.ts.map