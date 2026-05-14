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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("../database/entities/class.entity");
const uuid_1 = require("uuid");
let ClassesService = class ClassesService {
    constructor(classRepository) {
        this.classRepository = classRepository;
    }
    async create(createClassDto, userId) {
        const newClass = this.classRepository.create({
            id: (0, uuid_1.v4)(),
            ...createClassDto,
            teacherId: userId,
        });
        return this.classRepository.save(newClass);
    }
    async findAll() {
        return this.classRepository.find({
            relations: ['teacher', 'students'],
        });
    }
    async findById(id) {
        const classEntity = await this.classRepository.findOne({
            where: { id },
            relations: ['teacher', 'students', 'assignments', 'notes'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException('Class not found');
        }
        return classEntity;
    }
    async update(id, updateClassDto, userId) {
        const classEntity = await this.findById(id);
        if (classEntity.teacherId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this class');
        }
        Object.assign(classEntity, updateClassDto);
        return this.classRepository.save(classEntity);
    }
    async delete(id, userId) {
        const classEntity = await this.findById(id);
        if (classEntity.teacherId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this class');
        }
        await this.classRepository.remove(classEntity);
        return { message: 'Class deleted successfully' };
    }
    async getStudents(classId) {
        const classEntity = await this.findById(classId);
        return classEntity.students;
    }
    async enrollStudent(classId, studentId) {
        const classEntity = await this.findById(classId);
        // Add enrollment logic here
        return { message: 'Student enrolled successfully' };
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClassesService);
//# sourceMappingURL=classes.service.js.map