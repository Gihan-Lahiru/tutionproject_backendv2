"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const user_entity_1 = require("../database/entities/user.entity");
const class_entity_1 = require("../database/entities/class.entity");
const assignment_entity_1 = require("../database/entities/assignment.entity");
const submission_entity_1 = require("../database/entities/submission.entity");
const note_entity_1 = require("../database/entities/note.entity");
const video_entity_1 = require("../database/entities/video.entity");
const payment_entity_1 = require("../database/entities/payment.entity");
const paper_entity_1 = require("../database/entities/paper.entity");
const notification_entity_1 = require("../database/entities/notification.entity");
const entities = [
    user_entity_1.User,
    class_entity_1.Class,
    assignment_entity_1.Assignment,
    submission_entity_1.Submission,
    note_entity_1.Note,
    video_entity_1.Video,
    payment_entity_1.Payment,
    paper_entity_1.Paper,
    notification_entity_1.Notification,
];
exports.typeOrmConfig = process.env.NODE_ENV === 'production'
    ? {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tuition_sir',
        entities,
        synchronize: false,
        logging: process.env.DB_LOGGING === 'true',
    }
    : {
        type: 'sqlite',
        database: 'tuition_sir.db',
        entities,
        synchronize: true,
        logging: false,
    };
//# sourceMappingURL=database.config.js.map