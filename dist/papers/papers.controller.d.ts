import { PapersService } from './papers.service';
import { Request, Response } from 'express';
export declare class PapersController {
    private papersService;
    constructor(papersService: PapersService);
    upload(file: any, uploadDto: {
        title: string;
        grade: string;
        type?: string;
        topic?: string;
        class_id?: string;
    }, req: Request): Promise<import("../database/entities/paper.entity").Paper>;
    findAll(type?: string): Promise<import("../database/entities/paper.entity").Paper[]>;
    findByGrade(grade: string): Promise<import("../database/entities/paper.entity").Paper[]>;
    findById(id: string): Promise<import("../database/entities/paper.entity").Paper>;
    getFile(id: string, res: Response): Promise<void>;
    download(id: string, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=papers.controller.d.ts.map