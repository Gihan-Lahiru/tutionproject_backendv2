import { VideosService } from './videos.service';
import { Request } from 'express';
export declare class VideosController {
    private videosService;
    constructor(videosService: VideosService);
    create(createVideoDto: any, req: Request): Promise<import("../database/entities/video.entity").Video>;
    createForClass(classId: string, createVideoDto: any, req: Request): Promise<import("../database/entities/video.entity").Video>;
    findAll(): Promise<import("../database/entities/video.entity").Video[]>;
    findByClass(classId: string): Promise<import("../database/entities/video.entity").Video[]>;
    findByGradeAndSubject(grade: string, subject: string): Promise<import("../database/entities/video.entity").Video[]>;
    findById(id: string): Promise<import("../database/entities/video.entity").Video>;
    update(id: string, updateVideoDto: any): Promise<import("../database/entities/video.entity").Video>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=videos.controller.d.ts.map