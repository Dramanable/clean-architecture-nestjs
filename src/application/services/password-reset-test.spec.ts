import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password-reset-simple.service';
import { TOKENS } from '../../shared/constants/injection-tokens';

describe('PasswordResetService (Simplified)', () => {
  let service: PasswordResetService;
  let mockUserRepository: any;
  let mockEmailService: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    mockEmailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.EMAIL_SERVICE,
          useValue: mockEmailService,
        },
        {
          provide: TOKENS.LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
  });

  describe('requestPasswordReset', () => {
    it('should return success for valid email', async () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = await service.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset request processed');
    });

    it('should return success even for non-existent email (security)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Act
      const result = await service.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset request processed');
    });
  });

  describe('resetPassword', () => {
    it('should return success for valid input', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';

      // Act
      const result = await service.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset successfully');
    });

    it('should reject weak passwords', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = '123';

      // Act
      const result = await service.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password does not meet security requirements');
    });
  });
});
