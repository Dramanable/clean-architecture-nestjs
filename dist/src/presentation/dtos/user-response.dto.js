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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedUserResponseDto = exports.UserDetailResponseDto = exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
class UserResponseDto {
    id;
    email;
    name;
    role;
    createdAt;
    updatedAt;
    passwordChangeRequired;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Identifiant unique de l'utilisateur",
        example: 'usr_1234567890abcdef',
        format: 'uuid',
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Adresse email de l'utilisateur",
        example: 'john.doe@example.com',
        format: 'email',
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj.email?.value || obj.email),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Nom complet de l'utilisateur",
        example: 'John Doe',
        minLength: 1,
        maxLength: 100,
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Rôle de l'utilisateur dans le système",
        enum: user_role_enum_1.UserRole,
        example: user_role_enum_1.UserRole.USER,
        enumName: 'UserRole',
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(user_role_enum_1.UserRole),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date de création du compte utilisateur',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time',
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date de dernière modification du compte',
        example: '2024-01-20T14:45:00.000Z',
        format: 'date-time',
        required: false,
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Indique si l'utilisateur doit changer son mot de passe",
        example: false,
        default: false,
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "passwordChangeRequired", void 0);
class UserDetailResponseDto extends UserResponseDto {
    emailVerified;
    lastLoginAt;
    failedLoginAttempts;
}
exports.UserDetailResponseDto = UserDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Statut de vérification de l'email",
        example: true,
        default: false,
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserDetailResponseDto.prototype, "emailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date de dernière connexion',
        example: '2024-01-22T08:15:00.000Z',
        format: 'date-time',
        required: false,
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserDetailResponseDto.prototype, "lastLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de tentatives de connexion échouées',
        example: 0,
        minimum: 0,
        default: 0,
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserDetailResponseDto.prototype, "failedLoginAttempts", void 0);
class PaginatedUserResponseDto {
    data;
    meta;
}
exports.PaginatedUserResponseDto = PaginatedUserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Liste des utilisateurs pour la page actuelle',
        type: [UserResponseDto],
        isArray: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], PaginatedUserResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Métadonnées de pagination',
        type: 'object',
        properties: {
            currentPage: {
                type: 'number',
                description: 'Numéro de la page actuelle',
                example: 1,
                minimum: 1,
            },
            itemsPerPage: {
                type: 'number',
                description: "Nombre d'éléments par page",
                example: 10,
                minimum: 1,
                maximum: 100,
            },
            totalItems: {
                type: 'number',
                description: "Nombre total d'éléments",
                example: 150,
                minimum: 0,
            },
            totalPages: {
                type: 'number',
                description: 'Nombre total de pages',
                example: 15,
                minimum: 0,
            },
            hasNext: {
                type: 'boolean',
                description: "Indique s'il y a une page suivante",
                example: true,
            },
            hasPrevious: {
                type: 'boolean',
                description: "Indique s'il y a une page précédente",
                example: false,
            },
        },
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], PaginatedUserResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=user-response.dto.js.map