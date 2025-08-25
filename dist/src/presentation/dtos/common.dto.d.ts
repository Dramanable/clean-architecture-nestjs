export declare class PaginationDto {
    page?: number;
    limit?: number;
}
export declare class ApiErrorResponseDto {
    statusCode: number;
    message: string;
    details?: string[];
    code?: string;
    timestamp: string;
    path: string;
}
export declare class ApiSuccessResponseDto {
    message: string;
    timestamp: string;
}
