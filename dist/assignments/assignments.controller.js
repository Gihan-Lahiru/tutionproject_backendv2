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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const dashboard_access_guard_1 = require("../common/guards/dashboard-access.guard");
const assignments_service_1 = require("./assignments.service");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const submit_assignment_dto_1 = require("./dto/submit-assignment.dto");
const pdf_watermark_service_1 = require("../common/services/pdf-watermark.service");
let AssignmentsController = class AssignmentsController {
    constructor(assignmentsService, pdfWatermarkService) {
        this.assignmentsService = assignmentsService;
        this.pdfWatermarkService = pdfWatermarkService;
    }
    async create(classId, createAssignmentDto) {
        return this.assignmentsService.create(createAssignmentDto, classId);
    }
    async findByClass(classId) {
        return this.assignmentsService.findByClass(classId);
    }
    async findById(id) {
        return this.assignmentsService.findById(id);
    }
    async submit(assignmentId, submitDto, req) {
        return this.assignmentsService.submit(assignmentId, req.user.id, submitDto);
    }
    async grade(submissionId, gradeDto) {
        return this.assignmentsService.gradeSubmission(submissionId, gradeDto.marks, gradeDto.remarks);
    }
    async getSubmissions(assignmentId) {
        return this.assignmentsService.getSubmissionsByAssignment(assignmentId);
    }
    async download(id, res, req) {
        const assignment = await this.assignmentsService.findById(id);
        if (!assignment || !assignment.attachmentUrl) {
            throw new common_1.NotFoundException('Assignment file not found');
        }
        const filename = `Assignment_${assignment.title.replace(/\s+/g, '_')}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        const isPdf = assignment.attachmentUrl.toLowerCase().includes('.pdf');
        if (isPdf) {
            const watermarkedBuffer = await this.pdfWatermarkService.addWatermarkToPdfUrl(assignment.attachmentUrl, req.user.name, req.user.grade);
            if (watermarkedBuffer) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Length', watermarkedBuffer.length);
                return res.send(watermarkedBuffer);
            }
        }
        return res.redirect(assignment.attachmentUrl);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Post)(':classId'),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('class/:classId'),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findByClass", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_assignment_dto_1.SubmitAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "submit", null);
__decorate([
    (0, common_1.Put)(':submissionId/grade'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "grade", null);
__decorate([
    (0, common_1.Get)(':assignmentId/submissions'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getSubmissions", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "download", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, common_1.Controller)('api/assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, dashboard_access_guard_1.DashboardAccessGuard),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService,
        pdf_watermark_service_1.PdfWatermarkService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map