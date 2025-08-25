import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { UserOnboardingApplicationService } from '../../application/services/user-onboarding.application-service';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto, UserResponseDto } from '../dtos/user.dto';
export declare class UserController {
    private readonly userRepository;
    private readonly logger;
    private readonly i18n;
    private readonly userOnboardingService;
    private readonly getUserUseCase;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService, userOnboardingService: UserOnboardingApplicationService);
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getUser(id: string): Promise<UserResponseDto>;
}
