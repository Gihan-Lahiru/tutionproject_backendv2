"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notes_controller_1 = require("./notes.controller");
const notes_service_1 = require("./notes.service");
const note_entity_1 = require("../database/entities/note.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
const class_entity_1 = require("../database/entities/class.entity");
const user_entity_1 = require("../database/entities/user.entity");
const upload_service_1 = require("../common/services/upload.service");
let NotesModule = class NotesModule {
};
exports.NotesModule = NotesModule;
exports.NotesModule = NotesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([note_entity_1.Note, notification_entity_1.Notification, class_entity_1.Class, user_entity_1.User])],
        controllers: [notes_controller_1.NotesController],
        providers: [notes_service_1.NotesService, upload_service_1.UploadService],
    })
], NotesModule);
//# sourceMappingURL=notes.module.js.map