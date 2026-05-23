"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
let UploadService = UploadService_1 = class UploadService {
    constructor() {
        this.logger = new common_1.Logger(UploadService_1.name);
    }
    async uploadFile(file, folder) {
        // file: { originalname, buffer }
        const uploadsRoot = (0, path_1.join)(process.cwd(), 'uploads');
        const targetFolder = (0, path_1.join)(uploadsRoot, folder);
        await fs_1.promises.mkdir(targetFolder, { recursive: true });
        const extMatch = (file.originalname || '').match(/\.([a-z0-9]+)$/i);
        const ext = extMatch ? `.${extMatch[1]}` : '';
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const originalName = String(file.originalname || filename).trim();
        const relativePath = `${folder}/${filename}`;
        const absolutePath = (0, path_1.join)(uploadsRoot, relativePath);
        await fs_1.promises.writeFile(absolutePath, file.buffer);
        const host = process.env.APP_HOST || `http://localhost:5000`;
        const secure_url = `${host}/uploads/${relativePath}`;
        return { secure_url, public_id: relativePath, original_name: originalName };
    }
    async deleteFile(publicId) {
        try {
            const uploadsRoot = (0, path_1.join)(process.cwd(), 'uploads');
            const absolutePath = (0, path_1.join)(uploadsRoot, publicId);
            await fs_1.promises.unlink(absolutePath);
            return { result: 'deleted' };
        }
        catch (err) {
            this.logger.warn(`deleteFile failed for ${publicId}: ${err?.message || err}`);
            return { result: 'not_found' };
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map