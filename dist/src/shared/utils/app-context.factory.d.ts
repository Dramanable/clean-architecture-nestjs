export interface AppContext {
    correlationId: string;
    operation: string;
    timestamp: string;
    requestingUser?: {
        id: string;
        role?: string;
    };
    clientInfo?: {
        ip: string;
        userAgent?: string;
    };
    metadata?: Record<string, any>;
}
export declare class AppContextFactory {
    private context;
    static create(): AppContextFactory;
    operation(operation: string): AppContextFactory;
    requestingUser(userId?: string, role?: string): AppContextFactory;
    clientInfo(ip: string, userAgent?: string): AppContextFactory;
    metadata(metadata: Record<string, any>): AppContextFactory;
    build(): AppContext;
}
