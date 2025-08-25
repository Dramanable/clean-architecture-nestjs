"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const app_config_service_1 = require("./infrastructure/config/app-config.service");
const swagger_config_1 = require("./infrastructure/swagger/swagger.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const configService = app.get(app_config_service_1.AppConfigService);
    logger.log('Configuring security middlewares...');
    app.enableCors({
        origin: configService.getCorsOrigins(),
        credentials: configService.getCorsCredentials(),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Headers',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Pagination'],
        maxAge: 86400,
    });
    app.use((0, helmet_1.default)(configService.getHelmetConfig()));
    logger.log('Configuring performance middlewares...');
    app.use((0, compression_1.default)(configService.getCompressionConfig()));
    const bodyConfig = configService.getBodyParserConfig();
    app.useBodyParser('json', bodyConfig.json);
    app.useBodyParser('urlencoded', bodyConfig.urlencoded);
    logger.log('Configuring global settings...');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        disableErrorMessages: configService.isProduction(),
        validationError: {
            target: false,
            value: false,
        },
    }));
    if (configService.isProduction()) {
        app.set('trust proxy', 1);
    }
    app.setGlobalPrefix('api/v1', {
        exclude: ['/health', '/docs', '/api/docs'],
    });
    if (configService.isDevelopment()) {
        logger.log('Setting up Swagger documentation...');
        (0, swagger_config_1.setupSwagger)(app);
        logger.log(`📖 Swagger documentation available at http://${configService.getHost()}:${configService.getPort()}/api/docs`);
    }
    const environment = configService.getEnvironment();
    const port = configService.getPort();
    const host = configService.getHost();
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`🔧 Configuration loaded successfully`);
    if (configService.isDevelopment()) {
        logger.log('📝 Development mode: Enhanced logging enabled');
        logger.log('🔓 Development mode: Relaxed security policies');
    }
    if (configService.isProduction()) {
        logger.log('🔒 Production mode: Security hardened');
        logger.log('⚡ Production mode: Performance optimized');
    }
    await app.listen(port, host);
    logger.log(`🚀 Application running on http://${host}:${port}`);
    logger.log(`🔗 API Base URL: http://${host}:${port}/api/v1`);
    logger.log(`💊 Health Check: http://${host}:${port}/health`);
    if (configService.isDevelopment()) {
        logger.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
    }
    logger.log('✅ Application started successfully');
}
void bootstrap().catch((error) => {
    const logger = new common_1.Logger('Bootstrap');
    logger.error('❌ Failed to start application', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map