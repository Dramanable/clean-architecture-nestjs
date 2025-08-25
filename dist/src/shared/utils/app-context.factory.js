"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContextFactory = void 0;
const uuid_1 = require("uuid");
class AppContextFactory {
    context = {
        correlationId: (0, uuid_1.v4)(),
        timestamp: new Date().toISOString(),
    };
    static create() {
        return new AppContextFactory();
    }
    operation(operation) {
        this.context.operation = operation;
        return this;
    }
    requestingUser(userId, role) {
        if (userId) {
            this.context.requestingUser = {
                id: userId,
                role,
            };
        }
        return this;
    }
    clientInfo(ip, userAgent) {
        this.context.clientInfo = {
            ip,
            userAgent,
        };
        return this;
    }
    metadata(metadata) {
        this.context.metadata = {
            ...this.context.metadata,
            ...metadata,
        };
        return this;
    }
    build() {
        if (!this.context.operation) {
            throw new Error('Operation is required for AppContext');
        }
        return {
            correlationId: this.context.correlationId,
            operation: this.context.operation,
            timestamp: this.context.timestamp,
            requestingUser: this.context.requestingUser,
            clientInfo: this.context.clientInfo,
            metadata: this.context.metadata,
        };
    }
}
exports.AppContextFactory = AppContextFactory;
//# sourceMappingURL=app-context.factory.js.map