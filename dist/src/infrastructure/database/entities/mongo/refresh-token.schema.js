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
exports.RefreshTokenSchema = exports.RefreshToken = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let RefreshToken = class RefreshToken {
    _id;
    tokenHash;
    userId;
    deviceId;
    userAgent;
    ipAddress;
    expiresAt;
    isRevoked;
    revokedAt;
    revokedReason;
    tenantId;
    metadata;
    createdAt;
    updatedAt;
};
exports.RefreshToken = RefreshToken;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], RefreshToken.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, maxlength: 500 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "tokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], RefreshToken.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ maxlength: 100, default: null }),
    __metadata("design:type", String)
], RefreshToken.prototype, "deviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ maxlength: 500, default: null }),
    __metadata("design:type", String)
], RefreshToken.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ maxlength: 45, default: null }),
    __metadata("design:type", String)
], RefreshToken.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], RefreshToken.prototype, "isRevoked", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "revokedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ maxlength: 100, default: null }),
    __metadata("design:type", String)
], RefreshToken.prototype, "revokedReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ maxlength: 100, default: null }),
    __metadata("design:type", String)
], RefreshToken.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "metadata", void 0);
exports.RefreshToken = RefreshToken = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'refresh_tokens',
        timestamps: true,
        versionKey: '__version',
    })
], RefreshToken);
exports.RefreshTokenSchema = mongoose_1.SchemaFactory.createForClass(RefreshToken);
exports.RefreshTokenSchema.index({ userId: 1 });
exports.RefreshTokenSchema.index({ expiresAt: 1 });
exports.RefreshTokenSchema.index({ isRevoked: 1 });
exports.RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
exports.RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
exports.RefreshTokenSchema.index({ tenantId: 1, userId: 1 });
exports.RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//# sourceMappingURL=refresh-token.schema.js.map