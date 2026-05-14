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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assignment_entity_1 = require("../database/entities/assignment.entity");
const submission_entity_1 = require("../database/entities/submission.entity");
const uuid_1 = require("uuid");
let AssignmentsService = class AssignmentsService {
    constructor(assignmentRepository, submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }
    async create(createAssignmentDto, classId) {
        const assignment = this.assignmentRepository.create({
            id: (0, uuid_1.v4)(),
            ...createAssignmentDto,
            classId,
        });
        return this.assignmentRepository.save(assignment);
    }
    async findByClass(classId) {
        return this.assignmentRepository.find({
            where: { classId },
            relations: ['submissions'],
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const assignment = await this.assignmentRepository.findOne({
            where: { id },
            relations: ['submissions', 'class'],
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        return assignment;
    }
    async submit(assignmentId, studentId, submitDto) {
        const assignment = await this.findById(assignmentId);
        const existing = await this.submissionRepository.findOne({
            where: { assignmentId, studentId },
        });
        if (existing) {
            Object.assign(existing, submitDto);
            return this.submissionRepository.save(existing);
        }
        const submission = this.submissionRepository.create({
            id: (0, uuid_1.v4)(),
            assignmentId,
            studentId,
            ...submitDto,
        });
        return this.submissionRepository.save(submission);
    }
    async gradeSubmission(submissionId, marks, remarks) {
        const submission = await this.submissionRepository.findOne({
            where: { id: submissionId },
        });
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        submission.marks = marks;
        submission.remarks = remarks;
        return this.submissionRepository.save(submission);
    }
    async getSubmissionsByAssignment(assignmentId) {
        return this.submissionRepository.find({
            where: { assignmentId },
            relations: ['student'],
        });
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(1, (0, typeorm_1.InjectRepository)(submission_entity_1.Submission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map