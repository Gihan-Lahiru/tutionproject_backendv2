import { Repository } from 'typeorm';
import { Video } from '../database/entities/video.entity';
export declare class VideosService {
    private videoRepository;
    constructor(videoRepository: Repository<Video>);
    create(createVideoDto: any): Promise<Video[]>;
    findAll(): Promise<Video[]>;
    findByGradeAndSubject(grade: string, subject: string): Promise<Video[]>;
    findById(id: string): Promise<Video>;
    update(id: string, updateVideoDto: any): Promise<Video>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=videos.service.d.ts.map