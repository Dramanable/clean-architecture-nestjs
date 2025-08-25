import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserRole } from '../../../shared/enums/user-role.enum';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
export interface CreateUserRequest {
    email: string;
    name: string;
    role: UserRole;
    requestingUserId: string;
}
export interface CreateUserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
}
export declare class CreateUserUseCase {
    protected readonly userRepository: UserRepository;
    protected readonly logger: Logger;
    protected readonly i18n: I18nService;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService);
    execute(request: CreateUserRequest): Promise<CreateUserResponse>;
    private validatePermissions;
    private validateInput;
}
