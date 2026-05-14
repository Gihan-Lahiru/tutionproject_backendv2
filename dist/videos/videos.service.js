"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const video_entity_1 = require("../database/entities/video.entity");
const uuid_1 = require("uuid");
let VideosService = class VideosService {
    constructor(videoRepository) {
        this.videoRepository = videoRepository;
    }
    async create(createVideoDto) {
        const video = this.videoRepository.create({
            id: (0, uuid_1.v4)(),
            ...createVideoDto,
        });
        return this.videoRepository.save(video);
    }
    async findAll() {
        return this.videoRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findByGradeAndSubject(grade, subject) {
        return this.videoRepository.find({
            where: { grade, subject },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new common_1.NotFoundException('Video not found');
        }
        return video;
    }
    async update(id, updateVideoDto) {
        const video = await this.findById(id);
        Object.assign(video, updateVideoDto);
        return this.videoRepository.save(video);
    }
    async delete(id) {
        const video = await this.findById(id);
        await this.videoRepository.remove(video);
        return { message: 'Video deleted successfully' };
    }
};
exports.VideosService = VideosService;
exports.VideosService = VideosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(video_entity_1.Video)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VideosService);
//# sourceMappingURL=videos.service.js.map