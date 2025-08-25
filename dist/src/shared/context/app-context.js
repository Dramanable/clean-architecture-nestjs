"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContextFactory = void 0;
class AppContextBuilderImpl {
    context = {
        correlationId: this.generateCorrelationId(),
        timestamp: new Date(),
        startTime: Date.now(),
    };
    operation(name) {
        this.context.operation = name;
        this.context.operationId = this.generateOperationId(name);
        return this;
    }
    requestingUser(userId, role) {
        this.context.requestingUserId = userId;
        this.context.userRole = role;
        return this;
    }
    targetUser(userId) {
        this.context.targetUserId = userId;
        return this;
    }
    clientInfo(ipAddress, userAgent, deviceId) {
        this.context.ipAddress = ipAddress;
        this.context.userAgent = userAgent;
        this.context.deviceId = deviceId;
        return this;
    }
    session(sessionId) {
        this.context.sessionId = sessionId;
        return this;
    }
    tenant(tenantId) {
        this.context.tenantId = tenantId;
        return this;
    }
    organization(orgId) {
        this.context.organizationId = orgId;
        return this;
    }
    metadata(key, value) {
        if (!this.context.metadata) {
            this.context.metadata = {};
        }
        this.context.metadata[key] = value;
        return this;
    }
    build() {
        if (!this.context.operation) {
            throw new Error('Operation name is required');
        }
        return this.context;
    }
    generateCorrelationId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateOperationId(operation) {
        return `op_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
}
class AppContextFactory {
    static create() {
        return new AppContextBuilderImpl();
    }
    static simple(operation, requestingUserId) {
        const builder = new AppContextBuilderImpl().operation(operation);
        if (requestingUserId) {
            builder.requestingUser(requestingUserId);
        }
        return builder.build();
    }
    static auth(operation, email, clientInfo) {
        const builder = new AppContextBuilderImpl()
            .operation(operation)
            .metadata('email', email);
        if (clientInfo) {
            builder.clientInfo(clientInfo.ipAddress, clientInfo.userAgent, clientInfo.deviceId);
        }
        return builder.build();
    }
    static userOperation(operation, requestingUserId, targetUserId) {
        const builder = new AppContextBuilderImpl()
            .operation(operation)
            .requestingUser(requestingUserId);
        if (targetUserId) {
            builder.targetUser(targetUserId);
        }
        return builder.build();
    }
}
exports.AppContextFactory = AppContextFactory;
//# sourceMappingURL=app-context.js.map