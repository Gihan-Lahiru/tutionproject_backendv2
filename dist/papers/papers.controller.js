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
exports.PapersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const papers_service_1 = require("./papers.service");
const pdf_watermark_service_1 = require("../common/services/pdf-watermark.service");
let PapersController = class PapersController {
    constructor(papersService, pdfWatermarkService) {
        this.papersService = papersService;
        this.pdfWatermarkService = pdfWatermarkService;
    }
    async upload(file, uploadDto) {
        return this.papersService.upload(file, uploadDto.title, uploadDto.grade, uploadDto.type, uploadDto.topic, uploadDto.classId);
    }
    async findAll(type) {
        return this.papersService.findAll(type);
    }
    async findByGrade(grade) {
        return this.papersService.findByGrade(grade);
    }
    async findById(id) {
        return this.papersService.findById(id);
    }
    async delete(id) {
        return this.papersService.delete(id);
    }
    async incrementDownload(id) {
        const updated = await this.papersService.incrementDownload(id);
        return { downloads: updated.downloads || 0 };
    }
    async download(id, res, req) {
        const paper = await this.papersService.findById(id);
        if (!paper || !paper.fileUrl) {
            throw new common_1.NotFoundException('Paper file not found');
        }
        const filename = paper.originalName || this.papersService.getDownloadFilename(paper);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const isPdf = filename.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(paper.fileUrl, req.user.name, req.user.grade);
            if (watermarkedBuffer) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Length', watermarkedBuffer.length);
                return res.send(watermarkedBuffer);
            }
        }
        const localPath = await this.papersService.getDownloadPath(paper);
        if (localPath) {
            return res.sendFile(localPath);
        }
        return res.redirect(paper.fileUrl);
    }
    async file(id, res, req) {
        const paper = await this.papersService.findById(id);
        if (!paper || !paper.fileUrl) {
            throw new common_1.NotFoundException('Paper file not found');
        }
        const filename = paper.originalName || this.papersService.getDownloadFilename(paper);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        const isPdf = filename.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(paper.fileUrl, req.user.name, req.user.grade);
            if (watermarkedBuffer) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Length', watermarkedBuffer.length);
                return res.send(watermarkedBuffer);
            }
        }
        const localPath = await this.papersService.getDownloadPath(paper);
        if (localPath) {
            return res.sendFile(localPath);
        }
        return res.redirect(paper.fileUrl);
    }
};
exports.PapersController = PapersController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('grade/:grade'),
    __param(0, (0, common_1.Param)('grade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "findByGrade", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "findById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "incrementDownload", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "download", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "file", null);
exports.PapersController = PapersController = __decorate([
    (0, common_1.Controller)('api/papers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [papers_service_1.PapersService,
        pdf_watermark_service_1.PdfWatermarkService])
], PapersController);
//# sourceMappingURL=papers.controller.js.map