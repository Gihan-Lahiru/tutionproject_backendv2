import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { UploadService } from '../common/services/upload.service';
export declare class PapersService {
    private paperRepository;
    private uploadService;
    constructor(paperRepository: Repository<Paper>, uploadService: UploadService);
    upload(file: any, title: string, grade: string): Promise<Paper>;
    findAll(): Promise<Paper[]>;
    findByGrade(grade: string): Promise<Paper[]>;
    findById(id: string): Promise<Paper>;
    incrementDownload(id: string): Promise<Paper>;
    getLocalFilePath(paper: Paper): string;
    getDownloadPath(paper: Paper): Promise<string>;
    getDownloadFilename(paper: Paper): string;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=papers.service.d.ts.map