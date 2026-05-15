"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const videos_controller_1 = require("./videos.controller");
const videos_service_1 = require("./videos.service");
const video_entity_1 = require("../database/entities/video.entity");
const class_entity_1 = require("../database/entities/class.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
const user_entity_1 = require("../database/entities/user.entity");
let VideosModule = class VideosModule {
};
exports.VideosModule = VideosModule;
exports.VideosModule = VideosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([video_entity_1.Video, class_entity_1.Class, notification_entity_1.Notification, user_entity_1.User])],
        controllers: [videos_controller_1.VideosController],
        providers: [videos_service_1.VideosService],
        exports: [videos_service_1.VideosService],
    })
], VideosModule);
//# sourceMappingURL=videos.module.js.map