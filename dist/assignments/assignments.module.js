"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const assignments_controller_1 = require("./assignments.controller");
const assignments_service_1 = require("./assignments.service");
const assignment_entity_1 = require("../database/entities/assignment.entity");
const submission_entity_1 = require("../database/entities/submission.entity");
const class_entity_1 = require("../database/entities/class.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
const user_entity_1 = require("../database/entities/user.entity");
const users_module_1 = require("../users/users.module");
const pdf_watermark_module_1 = require("../common/services/pdf-watermark.module");
let AssignmentsModule = class AssignmentsModule {
};
exports.AssignmentsModule = AssignmentsModule;
exports.AssignmentsModule = AssignmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([assignment_entity_1.Assignment, submission_entity_1.Submission, class_entity_1.Class, notification_entity_1.Notification, user_entity_1.User]),
            pdf_watermark_module_1.PdfWatermarkModule,
            users_module_1.UsersModule,
        ],
        controllers: [assignments_controller_1.AssignmentsController],
        providers: [assignments_service_1.AssignmentsService],
        exports: [assignments_service_1.AssignmentsService],
    })
], AssignmentsModule);
//# sourceMappingURL=assignments.module.js.map