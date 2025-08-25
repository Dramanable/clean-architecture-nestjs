import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
export interface UpdateUserRequest {
    userId: string;
    email?: string;
    name?: string;
    role?: UserRole;
    requestingUserId: string;
}
export interface UpdateUserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    updatedAt: Date;
}
export declare class UpdateUserUseCase {
    private readonly userRepository;
    private readonly logger;
    private readonly i18n;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService);
    execute(request: UpdateUserRequest): Promise<UpdateUserResponse>;
    private validatePermissions;
    private validateRoleChange;
    private validateInput;
}
