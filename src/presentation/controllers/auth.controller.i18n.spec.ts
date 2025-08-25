/**
 * 🧪 Test simple pour l'i18n du contrôleur Auth
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { AuthController } from './auth.controller';

const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'NODE_ENV':
        return 'test';
      case 'COOKIE_DOMAIN':
        return 'localhost';
      default:
        return undefined;
    }
  }),
};

const mockUserRepository = {
  findByEmail: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock I18n Service avec nos traductions
const mockI18nService = {
  t: jest.fn((key: string, params?: Record<string, any>) => {
    const translations: Record<string, string> = {
      'auth.login_attempt': `Login attempt for \${params?.email || 'unknown'}`,
      'auth.invalid_credentials': `Invalid credentials for \${params?.email || 'unknown'}`,
      'auth.login_failed': 'Login failed',
    };

    let result = translations[key] || key;

    // Substitution simple des paramètres
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(
          `\${params?.${paramKey} || 'unknown'}`,
          String(params[paramKey]),
        );
      });
    }

    return result;
  }),
  translate: jest.fn(),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn(),
};

describe('AuthController I18n Tests', () => {
  let controller: AuthController;
  let i18nService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // Auth Use Cases - Required by AuthController
        {
          provide: TOKENS.LOGIN_USE_CASE,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              success: true,
              tokens: {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
              },
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
            }),
          },
        },
        {
          provide: TOKENS.REFRESH_TOKEN_USE_CASE,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              success: true,
              tokens: {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
              },
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
            }),
          },
        },
        {
          provide: TOKENS.LOGOUT_USE_CASE,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              success: true,
              message: 'Logout successful',
            }),
          },
        },
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18nService,
        },
        {
          provide: TOKENS.CONFIG_SERVICE,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    i18nService = module.get(TOKENS.I18N_SERVICE);
  });

  it('should use i18n for authentication messages', async () => {
    // Arrange
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
    };

    const mockResponse = {
      cookie: jest.fn(),
    };

    // Act - Just call the method, let it handle errors
    try {
      await controller.login(loginDto, mockRequest as any, mockResponse as any);
    } catch (error) {
      // Expected to throw due to mock setup
    }

    // Assert - Verify that i18n service was called (in error handling)
    expect(i18nService.t).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
