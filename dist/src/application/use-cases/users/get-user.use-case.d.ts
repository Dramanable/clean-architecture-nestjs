import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserRole } from '../../../shared/enums/user-role.enum';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
export interface GetUserRequest {
    userId: string;
    requestingUserId: string;
}
export interface GetUserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    passwordChangeRequired: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
export declare class GetUserUseCase {
    private readonly userRepository;
    private readonly logger;
    private readonly i18n;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService);
    execute(request: GetUserRequest): Promise<GetUserResponse>;
    private validateViewPermissions;
}
