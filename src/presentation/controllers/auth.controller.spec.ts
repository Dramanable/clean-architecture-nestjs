/**
 * 🔐 AUTH CONTROLLER TESTS - Clean Architecture with TDD
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let testModule: TestingModule;

  // Mocks
  const mockLoginUseCase = {
    execute: jest.fn().mockResolvedValue({
      success: true,
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    }),
  };

  const mockRefreshTokenUseCase = {
    execute: jest.fn().mockResolvedValue({
      success: true,
      tokens: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    }),
  };

  const mockLogoutUseCase = {
    execute: jest.fn().mockResolvedValue({
      success: true,
      message: 'Logout successful',
    }),
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn().mockReturnValue('Translated message'),
  };

  const mockRequest = {
    headers: { 'user-agent': 'test-agent' },
    ip: '127.0.0.1',
    cookies: {},
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: TOKENS.LOGIN_USE_CASE,
          useValue: mockLoginUseCase,
        },
        {
          provide: TOKENS.REFRESH_TOKEN_USE_CASE,
          useValue: mockRefreshTokenUseCase,
        },
        {
          provide: TOKENS.LOGOUT_USE_CASE,
          useValue: mockLogoutUseCase,
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
          useValue: {
            getEnvironment: jest.fn().mockReturnValue('test'),
            getAccessTokenExpirationTime: jest.fn().mockReturnValue(3600),
            getRefreshTokenExpirationDays: jest.fn().mockReturnValue(30),
          },
        },
      ],
    }).compile();

    controller = testModule.get<AuthController>(AuthController);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (testModule) {
      await testModule.close();
    }
  });

  describe('🔐 POST /auth/login', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('👤 GET /auth/me', () => {
    it('should return user information', async () => {
      // Act
      const result = await controller.me(mockRequest as any);

      // Assert
      expect(result).toEqual({
        user: {
          id: 'current-user',
          email: 'user@example.com',
          name: 'Current User',
          role: 'USER',
        },
      });
    });
  });
});
