"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PapersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const papers_controller_1 = require("./papers.controller");
const papers_service_1 = require("./papers.service");
const paper_entity_1 = require("../database/entities/paper.entity");
const user_entity_1 = require("../database/entities/user.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
const class_entity_1 = require("../database/entities/class.entity");
const upload_service_1 = require("../common/services/upload.service");
const notifications_module_1 = require("../notifications/notifications.module");
const pdf_watermark_module_1 = require("../common/services/pdf-watermark.module");
let PapersModule = class PapersModule {
};
exports.PapersModule = PapersModule;
exports.PapersModule = PapersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([paper_entity_1.Paper, user_entity_1.User, notification_entity_1.Notification, class_entity_1.Class]), notifications_module_1.NotificationsModule, pdf_watermark_module_1.PdfWatermarkModule],
        controllers: [papers_controller_1.PapersController],
        providers: [papers_service_1.PapersService, upload_service_1.UploadService],
        exports: [papers_service_1.PapersService],
    })
], PapersModule);
//# sourceMappingURL=papers.module.js.map