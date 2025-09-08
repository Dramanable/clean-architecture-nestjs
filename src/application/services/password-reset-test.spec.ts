import { PasswordResetService } from './password-reset-simple.service';

// Types pour les mocks
type MockUserRepository = {
  findByEmail: jest.Mock;
  save: jest.Mock;
};

type MockEmailService = {
  sendPasswordResetEmail: jest.Mock;
};

type MockLogger = {
  info: jest.Mock;
  error: jest.Mock;
};

// Mock simple sans NestJS pour éviter les dépendances circulaires
describe.skip('PasswordResetService (Simplified)', () => {
  let service: PasswordResetService;
  let mockUserRepository: MockUserRepository;
  let mockEmailService: MockEmailService;
  let mockLogger: MockLogger;

  beforeEach(() => {
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

    // Création directe sans NestJS TestingModule
    service = new PasswordResetService(
      mockUserRepository as unknown as any,
      mockEmailService as unknown as any,
      mockLogger as unknown as any,
    );
  });

  describe('requestPasswordReset', () => {
    it('should return success for valid email', async () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = await service.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('If this email exists, you will receive password reset instructions.');
    });

    it('should return success even for non-existent email (security)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Act
      const result = await service.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If this email exists, you will receive password reset instructions.',
      );
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
      expect(result.message).toBe('Password successfully reset.');
    });

    it('should reject weak passwords', async () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = '123';

      // Act
      const result = await service.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password must be at least 8 characters long');
    });
  });
});
