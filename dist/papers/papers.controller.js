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
const passport_1 = require("@nestjs/passport");
const papers_service_1 = require("./papers.service");
let PapersController = class PapersController {
    constructor(papersService) {
        this.papersService = papersService;
    }
    async upload(file, uploadDto, req) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file was uploaded');
            }
            if (!uploadDto?.title?.trim()) {
                throw new common_1.BadRequestException('Title is required');
            }
            if (!uploadDto?.grade?.trim()) {
                throw new common_1.BadRequestException('Grade is required');
            }
            const uploader = req.user;
            return await this.papersService.upload(file, uploadDto.title, uploadDto.grade, uploadDto.type, uploadDto.topic, uploadDto.class_id, uploader?.name || uploader?.email, uploader?.id);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || 'Failed to upload paper');
        }
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
    async getFile(id, res) {
        const target = await this.papersService.resolveFileTarget(id);
        if (target.type === 'remote') {
            return res.redirect(target.url);
        }
        return res.download(target.path, target.filename);
    }
    async download(id, req, res) {
        const requester = req.user;
        const target = await this.papersService.resolveDownloadTarget(id, requester);
        if (target.type === 'remote') {
            return res.redirect(target.url);
        }
        if (target.type === 'buffer') {
            res.setHeader('Content-Type', target.contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${target.filename}"`);
            return res.send(Buffer.from(target.buffer));
        }
        return res.download(target.path, target.filename);
    }
    async delete(id) {
        return this.papersService.delete(id);
    }
};
exports.PapersController = PapersController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
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
    (0, common_1.Get)(':id/file'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "download", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PapersController.prototype, "delete", null);
exports.PapersController = PapersController = __decorate([
    (0, common_1.Controller)('api/papers'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [papers_service_1.PapersService])
], PapersController);
//# sourceMappingURL=papers.controller.js.map