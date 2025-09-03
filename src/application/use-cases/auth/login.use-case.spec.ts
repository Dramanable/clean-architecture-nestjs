import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { TOKENS } from '../../../shared/constants/injection-tokens';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
          useValue: {
            save: jest.fn(),
            revokeAllByUserId: jest.fn(),
          },
        },
        {
          provide: TOKENS.JWT_TOKEN_SERVICE,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
        {
          provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: TOKENS.CACHE_SERVICE,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: {
            t: jest.fn(),
          },
        },
        {
          provide: TOKENS.APP_CONFIG,
          useValue: {
            jwtConfig: {
              accessTokenSecret: 'test',
              refreshTokenSecret: 'test',
              accessTokenExpiration: '15m',
              refreshTokenExpiration: '7d',
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });
});
