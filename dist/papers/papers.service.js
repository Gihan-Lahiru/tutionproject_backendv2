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
exports.PapersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const paper_entity_1 = require("../database/entities/paper.entity");
const upload_service_1 = require("../common/services/upload.service");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const path_1 = require("path");
let PapersService = class PapersService {
    constructor(paperRepository, uploadService) {
        this.paperRepository = paperRepository;
        this.uploadService = uploadService;
    }
    async upload(file, title, grade) {
        const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/papers');
        const paper = this.paperRepository.create({
            id: (0, uuid_1.v4)(),
            title,
            grade,
            fileUrl: uploadResult.secure_url,
            filePublicId: uploadResult.public_id,
            originalName: uploadResult.original_name || file.originalname,
        });
        return this.paperRepository.save(paper);
    }
    async findAll() {
        return this.paperRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findByGrade(grade) {
        return this.paperRepository.find({
            where: { grade },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const paper = await this.paperRepository.findOne({ where: { id } });
        if (!paper) {
            throw new common_1.NotFoundException('Paper not found');
        }
        return paper;
    }
    async incrementDownload(id) {
        const paper = await this.findById(id);
        paper.downloads = (Number(paper.downloads) || 0) + 1;
        return this.paperRepository.save(paper);
    }
    getLocalFilePath(paper) {
        const uploadsRoot = (0, path_1.join)(process.cwd(), 'uploads');
        const publicId = String(paper.filePublicId || '').trim();
        const fileUrl = String(paper.fileUrl || '').trim();
        if (publicId.startsWith('local:')) {
            return (0, path_1.join)(uploadsRoot, publicId.replace(/^local:/, ''));
        }
        if (publicId) {
            return (0, path_1.join)(uploadsRoot, publicId);
        }
        if (fileUrl.startsWith('/uploads/')) {
            return (0, path_1.join)(process.cwd(), fileUrl.replace(/^\/uploads\//, 'uploads/'));
        }
        try {
            const parsed = new URL(fileUrl);
            if (parsed.pathname.startsWith('/uploads/')) {
                return (0, path_1.join)(process.cwd(), parsed.pathname.replace(/^\/uploads\//, 'uploads/'));
            }
        }
        catch {
            // Not a URL; fall through.
        }
        return null;
    }
    async getDownloadPath(paper) {
        const filePath = this.getLocalFilePath(paper);
        if (!filePath)
            return null;
        try {
            await fs_1.promises.access(filePath);
            return filePath;
        }
        catch {
            return null;
        }
    }
    getDownloadFilename(paper) {
        if (paper.originalName)
            return String(paper.originalName).trim();
        const filePath = this.getLocalFilePath(paper);
        if (filePath) {
            return (0, path_1.basename)(filePath);
        }
        return `${String(paper.title || 'paper').trim()}.pdf`;
    }
    async delete(id) {
        const paper = await this.findById(id);
        if (paper.filePublicId) {
            await this.uploadService.deleteFile(paper.filePublicId);
        }
        await this.paperRepository.remove(paper);
        return { message: 'Paper deleted successfully' };
    }
};
exports.PapersService = PapersService;
exports.PapersService = PapersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(paper_entity_1.Paper)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        upload_service_1.UploadService])
], PapersService);
//# sourceMappingURL=papers.service.js.map