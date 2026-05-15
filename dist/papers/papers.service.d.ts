import { Repository } from 'typeorm';
import { Paper } from '../database/entities/paper.entity';
import { User } from '../database/entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PapersService {
    private paperRepository;
    private userRepository;
    private uploadService;
    private notificationsService;
    constructor(paperRepository: Repository<Paper>, userRepository: Repository<User>, uploadService: UploadService, notificationsService: NotificationsService);
    private normalizeGradeBucket;
    upload(file: any, title: string, grade: string, type?: string, topic?: string, classId?: string, uploaderName?: string, teacherId?: string): Promise<Paper>;
    findAll(type?: string): Promise<Paper[]>;
    findByGrade(grade: string): Promise<Paper[]>;
    findById(id: string): Promise<Paper>;
    delete(id: string): Promise<{
        message: string;
    }>;
    resolveFileTarget(id: string): Promise<{
        type: "remote";
        url: string;
        filename: string;
        path?: undefined;
        mimeType?: undefined;
    } | {
        type: "local";
        path: string;
        filename: string;
        mimeType: string;
        url?: undefined;
    }>;
    resolveDownloadTarget(id: string, requester?: {
        id?: string;
        email?: string;
        role?: string;
        name?: string;
    }): Promise<{
        type: "remote";
        url: string;
        filename: string;
        path?: undefined;
        mimeType?: undefined;
    } | {
        type: "local";
        path: string;
        filename: string;
        mimeType: string;
        url?: undefined;
    } | {
        type: "remote";
        url: string;
        filename: string;
        watermarked: boolean;
        buffer?: undefined;
        contentType?: undefined;
    } | {
        type: "buffer";
        buffer: Uint8Array<ArrayBufferLike>;
        filename: string;
        contentType: string;
        url?: undefined;
        watermarked?: undefined;
    }>;
}
//# sourceMappingURL=papers.service.d.ts.map