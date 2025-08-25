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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_onboarding_application_service_1 = require("../../application/services/user-onboarding.application-service");
const get_user_use_case_1 = require("../../application/use-cases/users/get-user.use-case");
const injection_tokens_1 = require("../../shared/constants/injection-tokens");
const common_dto_1 = require("../dtos/common.dto");
const user_dto_1 = require("../dtos/user.dto");
let UserController = class UserController {
    userRepository;
    logger;
    i18n;
    userOnboardingService;
    getUserUseCase;
    constructor(userRepository, logger, i18n, userOnboardingService) {
        this.userRepository = userRepository;
        this.logger = logger;
        this.i18n = i18n;
        this.userOnboardingService = userOnboardingService;
        this.getUserUseCase = new get_user_use_case_1.GetUserUseCase(this.userRepository, this.logger, this.i18n);
    }
    async createUser(createUserDto) {
        this.logger.info('🎯 HTTP POST /users - Create user request', {
            operation: 'HTTP_CreateUser',
            requestData: createUserDto,
        });
        try {
            const result = await this.userOnboardingService.createUserWithOnboarding({
                requestingUserId: 'system',
                email: createUserDto.email,
                name: createUserDto.name,
                role: createUserDto.role,
                sendWelcomeEmail: createUserDto.sendWelcomeEmail ?? true,
            });
            this.logger.info('✅ HTTP POST /users - User onboarded successfully', {
                operation: 'HTTP_CreateUser',
                userId: result.id,
                onboardingStatus: result.onboardingStatus,
            });
            return {
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.role,
                passwordChangeRequired: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('❌ HTTP POST /users - User creation failed', error, {
                operation: 'HTTP_CreateUser',
                requestData: createUserDto,
            });
            throw error;
        }
    }
    async getUser(id) {
        this.logger.info('🎯 HTTP GET /users/:id - Get user request', {
            operation: 'HTTP_GetUser',
            userId: id,
        });
        try {
            const result = await this.getUserUseCase.execute({
                requestingUserId: 'system',
                userId: id,
            });
            this.logger.info('✅ HTTP GET /users/:id - User retrieved successfully', {
                operation: 'HTTP_GetUser',
                userId: id,
            });
            return {
                id: result.id,
                email: result.email,
                name: result.name,
                role: result.role,
                passwordChangeRequired: result.passwordChangeRequired,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt?.toISOString() || result.createdAt.toISOString(),
            };
        }
        catch (error) {
            this.logger.error('❌ HTTP GET /users/:id - User retrieval failed', error, {
                operation: 'HTTP_GetUser',
                userId: id,
            });
            throw error;
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new user',
        description: 'Creates a new user with onboarding process including welcome email',
    }),
    (0, swagger_1.ApiBody)({
        type: user_dto_1.CreateUserDto,
        description: 'User data for creation',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'User created successfully',
        type: user_dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid user data',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Email already exists',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Retrieves a user by their unique identifier',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User unique identifier',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User retrieved successfully',
        type: user_dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'User not found',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __param(0, (0, common_1.Inject)(injection_tokens_1.TOKENS.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(injection_tokens_1.TOKENS.LOGGER)),
    __param(2, (0, common_1.Inject)(injection_tokens_1.TOKENS.I18N_SERVICE)),
    __param(3, (0, common_1.Inject)(injection_tokens_1.TOKENS.USER_ONBOARDING_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object, user_onboarding_application_service_1.UserOnboardingApplicationService])
], UserController);
//# sourceMappingURL=user.controller.js.map