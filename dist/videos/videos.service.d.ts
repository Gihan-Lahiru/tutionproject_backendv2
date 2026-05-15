import { Repository } from 'typeorm';
import { Video } from '../database/entities/video.entity';
import { Class } from '../database/entities/class.entity';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
export declare class VideosService {
    private videoRepository;
    private classRepository;
    private notificationRepository;
    private userRepository;
    constructor(videoRepository: Repository<Video>, classRepository: Repository<Class>, notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    create(createVideoDto: any): Promise<Video[]>;
    findByClass(classId: string): Promise<Video[]>;
    findAll(): Promise<Video[]>;
    findByGradeAndSubject(grade: string, subject: string): Promise<Video[]>;
    findById(id: string): Promise<Video>;
    update(id: string, updateVideoDto: any): Promise<Video>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=videos.service.d.ts.map