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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const note_entity_1 = require("../database/entities/note.entity");
const upload_service_1 = require("../common/services/upload.service");
const uuid_1 = require("uuid");
const notification_entity_1 = require("../database/entities/notification.entity");
const class_entity_1 = require("../database/entities/class.entity");
const user_entity_1 = require("../database/entities/user.entity");
let NotesService = class NotesService {
    constructor(noteRepository, uploadService, notificationRepository, classRepository, userRepository) {
        this.noteRepository = noteRepository;
        this.uploadService = uploadService;
        this.notificationRepository = notificationRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }
    async create(createNoteDto, file, classId) {
        const uploadResult = await this.uploadService.uploadFile(file, 'tuition_sir/notes');
        const note = this.noteRepository.create({
            id: (0, uuid_1.v4)(),
            ...createNoteDto,
            classId,
            fileUrl: uploadResult.secure_url,
            fileType: file.mimetype,
            originalName: uploadResult.original_name || file.originalname,
        });
        const saved = await this.noteRepository.save(note);
        // create notifications for students in target class
        try {
            const classIdVal = String(saved.classId || '').trim();
            const titleVal = String(saved.title || '').trim() || 'New note';
            let targetStudents = [];
            if (classIdVal) {
                const fullClass = await this.classRepository.findOne({ where: { id: classIdVal }, relations: ['students'] });
                const classStudents = fullClass && Array.isArray(fullClass.students) ? fullClass.students : [];
                const classLocation = String(fullClass?.location || '').trim().toLowerCase();
                targetStudents = classStudents.filter((student) => {
                    const studentInstitute = String(student?.institute || '').trim().toLowerCase();
                    if (!classLocation)
                        return true;
                    return studentInstitute === classLocation;
                });
            }
            if (targetStudents.length) {
                const notifications = targetStudents.map((student) => ({
                    id: (0, uuid_1.v4)(),
                    userId: student.id,
                    type: 'note',
                    message: `${titleVal.length > 120 ? titleVal.slice(0, 117) + '...' : titleVal}`,
                    read: 0,
                }));
                await this.notificationRepository.save(notifications);
            }
        }
        catch (err) {
            console.warn('Failed to create notifications for note upload', err?.message || err);
        }
        return saved;
    }
    async findByClass(classId) {
        return this.noteRepository.find({
            where: { classId },
            order: { createdAt: 'DESC' },
        });
    }
    async findAll() {
        return this.noteRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        return this.noteRepository.findOne({ where: { id } });
    }
    async delete(id) {
        const note = await this.noteRepository.findOne({ where: { id } });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        await this.noteRepository.remove(note);
        return { message: 'Note deleted successfully' };
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(3, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        upload_service_1.UploadService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotesService);
//# sourceMappingURL=notes.service.js.map