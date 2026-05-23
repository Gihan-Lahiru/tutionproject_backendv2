import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { Notification } from '../database/entities/notification.entity';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
import { UploadService } from '../common/services/upload.service';
export declare class PapersService {
    private paperRepository;
    private uploadService;
    private notificationRepository;
    private classRepository;
    private userRepository;
    constructor(paperRepository: Repository<Paper>, uploadService: UploadService, notificationRepository: Repository<Notification>, classRepository: Repository<Class>, userRepository: Repository<User>);
    upload(file: any, title: string, grade?: string, type?: string, topic?: string, classId?: string): Promise<Paper>;
    findAll(type?: string): Promise<Paper[]>;
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