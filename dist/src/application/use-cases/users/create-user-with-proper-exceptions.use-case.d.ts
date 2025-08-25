import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { IEmailService } from '../../ports/email.port';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';
export interface CreateUserWithProperExceptionsRequest {
    email: string;
    name: string;
    role: UserRole;
    requestingUserId: string;
    sendWelcomeEmail?: boolean;
}
export interface CreateUserWithProperExceptionsResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    emailSent: boolean;
}
export declare class CreateUserWithProperExceptionsUseCase {
    private readonly userRepository;
    private readonly emailService;
    private readonly logger;
    private readonly i18n;
    constructor(userRepository: UserRepository, emailService: IEmailService, logger: Logger, i18n: I18nService);
    execute(request: CreateUserWithProperExceptionsRequest): Promise<CreateUserWithProperExceptionsResponse>;
    private validateRequestingUser;
    private validatePermissions;
    private validateUserData;
    private createUser;
    private sendWelcomeEmailIfRequested;
}
