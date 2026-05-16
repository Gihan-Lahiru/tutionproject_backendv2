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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const users_service_1 = require("./users.service");
const profilePicturesDir = (0, path_1.join)(process.cwd(), 'uploads', 'profile-pictures');
const ensureProfilePicturesDir = () => {
    if (!(0, fs_1.existsSync)(profilePicturesDir)) {
        (0, fs_1.mkdirSync)(profilePicturesDir, { recursive: true });
    }
};
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    sanitizeUser(user) {
        if (!user)
            return user;
        const { password, ...safeUser } = user;
        return {
            ...safeUser,
            profile_picture: safeUser.profilePicture ?? null,
        };
    }
    async findAll() {
        return { users: await this.usersService.findAll() };
    }
    async findStudents(status) {
        const users = await this.usersService.findByRole('student', status);
        return { users: users.map((user) => this.sanitizeUser(user)) };
    }
    async getMe(req) {
        return this.usersService.findById(req.user.id);
    }
    async getProfile(req) {
        const user = await this.usersService.findById(req.user.id);
        return { user: this.sanitizeUser(user) };
    }
    async updateProfile(req, updateUserDto) {
        const user = await this.usersService.update(req.user.id, updateUserDto);
        return { user: this.sanitizeUser(user) };
    }
    async createStudent(createUserDto) {
        if (!createUserDto?.email || !createUserDto?.name) {
            throw new common_1.BadRequestException('Name and email are required');
        }
        const user = await this.usersService.create({
            ...createUserDto,
            role: 'student',
        });
        return { user: this.sanitizeUser(user) };
    }
    async uploadProfilePicture(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('Profile picture file is required');
        }
        const profilePicturePath = `/uploads/profile-pictures/${file.filename}`;
        const user = await this.usersService.update(req.user.id, {
            profilePicture: profilePicturePath,
        });
        return {
            message: 'Profile picture updated successfully',
            profile_picture: profilePicturePath,
            user: this.sanitizeUser(user),
        };
    }
    async findById(id) {
        return this.sanitizeUser(await this.usersService.findById(id));
    }
    async findByRole(role) {
        return this.usersService.findByRole(role);
    }
    async update(id, updateUserDto) {
        return this.sanitizeUser(await this.usersService.update(id, updateUserDto));
    }
    async updateStudent(id, updateUserDto) {
        const user = await this.usersService.update(id, {
            ...updateUserDto,
            role: 'student',
        });
        return { user: this.sanitizeUser(user) };
    }
    async approveStudent(id) {
        const user = await this.usersService.approve(id);
        return {
            message: 'Student approved successfully',
            user: this.sanitizeUser(user),
        };
    }
    async rejectStudent(id, body) {
        const user = await this.usersService.reject(id, body.reason);
        return {
            message: 'Student rejected',
            user: this.sanitizeUser(user),
        };
    }
    async delete(id) {
        return this.usersService.delete(id);
    }
    async deleteStudent(id) {
        const user = await this.usersService.findById(id);
        if (user.role !== 'student') {
            throw new common_1.NotFoundException('Student not found');
        }
        return this.usersService.delete(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('students'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findStudents", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('students'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Post)('profile-picture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                ensureProfilePicturesDir();
                cb(null, profilePicturesDir);
            },
            filename: (_req, file, cb) => {
                const extension = (0, path_1.extname)(file.originalname || '').toLowerCase() || '.jpg';
                const uniqueName = `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${extension}`;
                cb(null, uniqueName);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const isImage = file.mimetype?.startsWith('image/');
            cb(isImage ? null : new common_1.BadRequestException('Only image files are allowed'), isImage);
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('role/:role'),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('students/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Post)('students/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "approveStudent", null);
__decorate([
    (0, common_1.Post)('students/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rejectStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)('students/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteStudent", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('api/users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map