import { PapersService } from './papers.service';
import { Response } from 'express';
export declare class PapersController {
    private papersService;
    constructor(papersService: PapersService);
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
    download(id: string, res: Response): Promise<void>;
    file(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=papers.controller.d.ts.map