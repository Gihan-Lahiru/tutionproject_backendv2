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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const payments_service_1 = require("./payments.service");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const receiptsDir = (0, path_1.join)(process.cwd(), 'uploads', 'receipts');
if (!(0, fs_1.existsSync)(receiptsDir)) {
    (0, fs_1.mkdirSync)(receiptsDir, { recursive: true });
}
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async uploadReceipt(req, file, body) {
        if (!file) {
            throw new common_1.BadRequestException('Receipt file is required');
        }
        const receiptUrl = `/uploads/receipts/${file.filename}`;
        return this.paymentsService.uploadReceipt(req.user.id, receiptUrl, body);
    }
    async approvePayment(id) {
        return this.paymentsService.approvePayment(id);
    }
    async rejectPayment(id) {
        return this.paymentsService.rejectPayment(id);
    }
    async create(createPaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }
    async findByUser(userId) {
        return this.paymentsService.findByUser(userId);
    }
    async getMyPayments(req) {
        return this.paymentsService.findByUser(req.user.id);
    }
    async getPendingReceipts() {
        return this.paymentsService.findPendingReceipts();
    }
    async findAll() {
        return this.paymentsService.findAll();
    }
    async findById(id) {
        return this.paymentsService.findById(id);
    }
    async update(id, updatePaymentDto) {
        return this.paymentsService.update(id, updatePaymentDto);
    }
    async updateStatus(id, statusDto) {
        return this.paymentsService.updateStatus(id, statusDto.status);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('upload-receipt'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt', {
        storage: (0, multer_1.diskStorage)({
            destination: receiptsDir,
            filename: (_req, file, cb) => {
                const extension = (0, path_1.extname)(file.originalname).toLowerCase();
                cb(null, `receipt_${Date.now()}${extension}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            const isValid = /^(image\/|application\/pdf)/.test(file.mimetype);
            cb(isValid ? null : new common_1.BadRequestException('Invalid file type'), isValid);
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "uploadReceipt", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "rejectPayment", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('my-payments'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMyPayments", null);
__decorate([
    (0, common_1.Get)('receipts/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPendingReceipts", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateStatus", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('api/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map