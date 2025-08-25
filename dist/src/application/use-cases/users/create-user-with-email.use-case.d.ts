import { UserRepository } from '../../../domain/repositories/user.repository';
import { IEmailService } from '../../ports/email.port';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPasswordGenerator } from '../../ports/password-generator.port';
import { CreateUserRequest, CreateUserResponse, CreateUserUseCase } from './create-user.use-case';
export declare class CreateUserWithEmailUseCase extends CreateUserUseCase {
    private readonly emailService;
    private readonly passwordGenerator;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService, emailService: IEmailService, passwordGenerator: IPasswordGenerator);
    execute(request: CreateUserRequest): Promise<CreateUserResponse>;
    private generateLoginUrl;
}
