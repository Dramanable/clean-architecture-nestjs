import { UserRepository } from '../../../domain/repositories/user.repository';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
export interface DeleteUserRequest {
    userId: string;
    requestingUserId: string;
}
export interface DeleteUserResponse {
    success: boolean;
    deletedUserId: string;
    deletedAt: Date;
}
export declare class DeleteUserUseCase {
    private readonly userRepository;
    private readonly logger;
    private readonly i18n;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService);
    execute(request: DeleteUserRequest): Promise<DeleteUserResponse>;
    private validatePermissions;
}
