/**
 * 🛡️ GlobalAuthGuard - Tests Unitaires Simplifiés
 * Tests basiques pour le guard d'authentification global
 */

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GlobalAuthGuard } from './global-auth.guard';
import { TOKENS } from '../../shared/constants/injection-tokens';

describe.skip('GlobalAuthGuard (Simple)', () => {
  let guard: GlobalAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalAuthGuard,
        {
          provide: 'JwtService',
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: 'Reflector',
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TOKENS.CACHE_SERVICE,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: TOKENS.COOKIE_SERVICE,
          useValue: {
            extractTokenFromCookies: jest.fn(),
          },
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: {
            t: jest.fn().mockReturnValue('Mock message'),
          },
        },
      ],
    }).compile();

    guard = module.get<GlobalAuthGuard>(GlobalAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should have canActivate method', () => {
    expect(guard.canActivate).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });
});
