"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('User Management API')
        .setDescription('Clean Architecture User Management System with comprehensive features')
        .setVersion('1.0.0')
        .addTag('users', 'User management operations')
        .addTag('auth', 'Authentication and authorization')
        .addTag('password-reset', 'Password reset operations')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addApiKey({
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for authentication',
    }, 'api-key')
        .addServer('http://localhost:3000', 'Development server')
        .addServer('https://api.example.com', 'Production server')
        .setContact('Support Team', 'https://example.com/support', 'support@example.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .setExternalDoc('API Documentation', 'https://docs.example.com')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        explorer: true,
        swaggerOptions: {
            filter: true,
            showRequestDuration: true,
            docExpansion: 'none',
            persistAuthorization: true,
            displayOperationId: false,
            displayRequestDuration: true,
        },
        customSiteTitle: 'User Management API Documentation',
        customfavIcon: '/favicon.ico',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        ],
    });
}
//# sourceMappingURL=swagger.config.js.map