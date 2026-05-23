"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3004',
            'http://localhost:3005',
        ],
        credentials: true,
    });
    // Allow moderately sized JSON bodies for thumbnail payloads
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((0, express_1.urlencoded)({ limit: '10mb', extended: true }));
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // Global exception filter
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    // Serve uploaded files
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Tuition Sir API')
        .setDescription('Learning Management System API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 5000;
    // Development-only debug route: create a notification directly
    if (process.env.NODE_ENV !== 'production') {
        try {
            const expressApp = app.getHttpAdapter().getInstance();
            const { NotificationsService } = await Promise.resolve().then(() => __importStar(require('./notifications/notifications.service')));
            let notificationsService = null;
            try {
                notificationsService = app.get(NotificationsService);
            }
            catch { }
            if (expressApp && notificationsService) {
                expressApp.post('/__debug/notify', async (req, res) => {
                    try {
                        const { userId, type = 'debug', message = 'Test notification from debug endpoint' } = req.body || {};
                        if (!userId)
                            return res.status(400).json({ message: 'userId is required' });
                        const note = await notificationsService.create({ userId, type, message, read: 0 });
                        return res.json({ notification: note });
                    }
                    catch (err) {
                        console.error('Debug notify error', err);
                        return res.status(500).json({ message: 'failed' });
                    }
                });
            }
        }
        catch (err) {
            console.warn('Failed to register debug notify route', err?.message || err);
        }
    }
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map