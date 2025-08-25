export interface AppContext {
    correlationId: string;
    operationId?: string;
    operation: string;
    timestamp: Date;
    requestingUserId?: string;
    targetUserId?: string;
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    sessionId?: string;
    tenantId?: string;
    organizationId?: string;
    startTime?: number;
    traceId?: string;
    metadata?: Record<string, any>;
}
export interface AppContextBuilder {
    operation(name: string): AppContextBuilder;
    requestingUser(userId: string, role?: string): AppContextBuilder;
    targetUser(userId: string): AppContextBuilder;
    clientInfo(ipAddress?: string, userAgent?: string, deviceId?: string): AppContextBuilder;
    session(sessionId: string): AppContextBuilder;
    tenant(tenantId: string): AppContextBuilder;
    organization(orgId: string): AppContextBuilder;
    metadata(key: string, value: any): AppContextBuilder;
    build(): AppContext;
}
export declare class AppContextFactory {
    static create(): AppContextBuilder;
    static simple(operation: string, requestingUserId?: string): AppContext;
    static auth(operation: string, email: string, clientInfo?: {
        ipAddress?: string;
        userAgent?: string;
        deviceId?: string;
    }): AppContext;
    static userOperation(operation: string, requestingUserId: string, targetUserId?: string): AppContext;
}
