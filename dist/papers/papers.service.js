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
const user_entity_1 = require("../database/entities/user.entity");
const upload_service_1 = require("../common/services/upload.service");
const notifications_service_1 = require("../notifications/notifications.service");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const pdf_lib_1 = require("pdf-lib");
let PapersService = class PapersService {
    constructor(paperRepository, userRepository, uploadService, notificationsService) {
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
        this.uploadService = uploadService;
        this.notificationsService = notificationsService;
    }
    normalizeGradeBucket(value) {
        const raw = String(value || '').trim();
        if (!raw)
            return '';
        const digits = raw.match(/\d+/)?.[0];
        if (digits)
            return digits;
        return raw.toLowerCase();
    }
    async upload(file, title, grade, type, topic, classId, uploaderName, teacherId) {
        const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/papers');
        const paper = this.paperRepository.create({
            id: (0, uuid_1.v4)(),
            title,
            grade,
            type: (type || 'Paper').trim(),
            topic: topic?.trim() || title,
            classId: classId?.trim() || null,
            fileUrl: uploadResult.secure_url,
            filePublicId: uploadResult.public_id,
            teacherId: teacherId?.trim() || null,
        });
        const savedPaper = await this.paperRepository.save(paper);
        const targetGrade = this.normalizeGradeBucket(grade);
        const students = await this.userRepository.find({ where: { role: 'student' } });
        const targetStudents = students.filter((student) => {
            if (!targetGrade)
                return true;
            return this.normalizeGradeBucket(student.grade) === targetGrade;
        });
        const uploaderLabel = String(uploaderName || 'Teacher').trim() || 'Teacher';
        const contentType = String(type || 'Paper').trim() || 'Paper';
        const contentTitle = String(topic || title || contentType).trim();
        const message = `${uploaderLabel} uploaded a new ${contentType}: ${contentTitle}`;
        await Promise.all(targetStudents.map((student) => this.notificationsService.create({
            userId: student.id,
            type: 'content_upload',
            message,
            read: 0,
        })));
        return savedPaper;
    }
    async findAll(type) {
        const normalizedType = String(type || '').trim();
        if (normalizedType) {
            return this.paperRepository.find({
                where: { type: normalizedType },
                order: { createdAt: 'DESC' },
            });
        }
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
    async delete(id) {
        const paper = await this.findById(id);
        if (paper.filePublicId) {
            await this.uploadService.deleteFile(paper.filePublicId);
        }
        await this.paperRepository.remove(paper);
        return { message: 'Paper deleted successfully' };
    }
    async resolveFileTarget(id) {
        const paper = await this.findById(id);
        const fileUrl = paper.fileUrl?.trim();
        if (!fileUrl) {
            throw new common_1.NotFoundException('Paper file not found');
        }
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            return {
                type: 'remote',
                url: fileUrl,
                filename: `${paper.title || 'paper'}`,
            };
        }
        const relativePath = fileUrl.replace(/^\/+/, '');
        const absolutePath = (0, path_1.resolve)(process.cwd(), relativePath);
        if (!(0, fs_1.existsSync)(absolutePath)) {
            throw new common_1.NotFoundException('Paper file not found on disk');
        }
        return {
            type: 'local',
            path: absolutePath,
            filename: `${paper.title || 'paper'}`,
            mimeType: 'application/octet-stream',
        };
    }
    async resolveDownloadTarget(id, requester) {
        const paper = await this.findById(id);
        const fileUrl = paper.fileUrl?.trim();
        if (!fileUrl) {
            throw new common_1.NotFoundException('Paper file not found');
        }
        const isPdf = (0, path_1.extname)(fileUrl).toLowerCase() === '.pdf' || /pdf/i.test(fileUrl);
        if (!isPdf) {
            return this.resolveFileTarget(id);
        }
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            return {
                type: 'remote',
                url: fileUrl,
                filename: `${paper.title || 'paper'}.pdf`,
                watermarked: false,
            };
        }
        const relativePath = fileUrl.replace(/^\/+/, '');
        const absolutePath = (0, path_1.resolve)(process.cwd(), relativePath);
        if (!(0, fs_1.existsSync)(absolutePath)) {
            throw new common_1.NotFoundException('Paper file not found on disk');
        }
        const sourceBytes = await (0, promises_1.readFile)(absolutePath);
        const pdfDoc = await pdf_lib_1.PDFDocument.load(sourceBytes);
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const brandLine = 'SCIENCE WITH MALEESHA';
        for (const page of pdfDoc.getPages()) {
            const { width, height } = page.getSize();
            const fontSize = Math.max(20, Math.min(width, height) / 9.5);
            const textWidth = brandLine.length * (Math.max(22, fontSize * 0.7) * 0.6); // Rough estimate
            page.drawText(brandLine, {
                x: (width - textWidth) / 2,
                y: height * 0.5,
                size: Math.max(22, fontSize * 0.7),
                font,
                color: (0, pdf_lib_1.rgb)(0.35, 0.35, 0.35),
                opacity: 0.18,
            });
        }
        const buffer = await pdfDoc.save();
        return {
            type: 'buffer',
            buffer,
            filename: `${(0, path_1.basename)(paper.title || 'paper')}.pdf`,
            contentType: 'application/pdf',
        };
    }
};
exports.PapersService = PapersService;
exports.PapersService = PapersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(paper_entity_1.Paper)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService,
        notifications_service_1.NotificationsService])
], PapersService);
//# sourceMappingURL=papers.service.js.map