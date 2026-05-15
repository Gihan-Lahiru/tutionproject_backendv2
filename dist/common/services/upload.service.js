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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const cloudinary_config_1 = require("../../config/cloudinary.config");
let UploadService = class UploadService {
    constructor() {
        (0, cloudinary_config_1.setupCloudinary)();
    }
    async uploadLocally(file, folder) {
        const relativeFolder = folder.replace(/^\/+|\/+$/g, '');
        const safeName = (0, path_1.basename)(file?.originalname || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}-${safeName || `file${(0, path_1.extname)(file?.originalname || '')}`}`;
        const uploadDir = (0, path_1.join)(process.cwd(), 'uploads', relativeFolder);
        await (0, promises_1.mkdir)(uploadDir, { recursive: true });
        const filePath = (0, path_1.join)(uploadDir, fileName);
        await (0, promises_1.writeFile)(filePath, file.buffer);
        const publicPath = `/uploads/${relativeFolder}/${fileName}`.replace(/\\/g, '/');
        return {
            secure_url: publicPath,
            public_id: `local:${relativeFolder}/${fileName}`,
        };
    }
    async uploadFile(file, folder) {
        const hasCloudinaryConfig = Boolean(process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET);
        if (!hasCloudinaryConfig) {
            return this.uploadLocally(file, folder);
        }
        try {
            return await new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                stream.end(file.buffer);
            });
        }
        catch (error) {
            return this.uploadLocally(file, folder);
        }
    }
    async deleteFile(publicId) {
        if (publicId?.startsWith('local:')) {
            const relativePath = publicId.replace(/^local:/, '');
            const filePath = (0, path_1.join)(process.cwd(), 'uploads', ...relativePath.split('/'));
            try {
                await (0, promises_1.unlink)(filePath);
            }
            catch (error) {
                // Ignore missing local files so deletes stay idempotent.
            }
            return { result: 'ok' };
        }
        return cloudinary_1.v2.uploader.destroy(publicId);
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadService);
//# sourceMappingURL=upload.service.js.map