/**
 * 🧪 INTEGRATION TEST - Test d'intégration Redis réel
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { TOKENS } from '../../shared/constants/injection-tokens';
import type { ICacheService } from '../../application/ports/cache.port';

describe.skip('Redis Integration Test', () => {
  let module: TestingModule;
  let loginUseCase: LoginUseCase;
  let cacheService: ICacheService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        InfrastructureModule,
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(TOKENS.LOGIN_USE_CASE);
    cacheService = module.get<ICacheService>(TOKENS.CACHE_SERVICE);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Real Redis Integration', () => {
    it('should connect to real Redis and perform basic operations', async () => {
      const testKey = 'integration:test:key';
      const testValue = 'integration-test-value';
      const ttl = 60;

      // Store data in Redis
      await expect(
        cacheService.set(testKey, testValue, ttl),
      ).resolves.not.toThrow();

      // Retrieve data from Redis
      const retrievedValue = await cacheService.get(testKey);
      expect(retrievedValue).toBe(testValue);

      // Check if key exists
      const exists = await cacheService.exists(testKey);
      expect(exists).toBe(true);

      // Clean up
      await cacheService.delete(testKey);

      // Verify deletion
      const existsAfterDelete = await cacheService.exists(testKey);
      expect(existsAfterDelete).toBe(false);
    }, 15000);

    it('should handle cache operations during login flow', async () => {
      // Note: This is a mock test since we need real user data
      // In a real scenario, you would:
      // 1. Create a test user in the database
      // 2. Perform login with valid credentials
      // 3. Verify user data is cached in Redis
      // 4. Clean up test data

      const userId = 'test-user-123';
      const cacheKey = `connected_user:${userId}`;
      const userData = JSON.stringify({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
      });

      // Simulate user caching that would happen during login
      await cacheService.set(cacheKey, userData, 1800); // 30 minutes

      // Verify user data is cached
      const cachedData = await cacheService.get(cacheKey);
      expect(cachedData).toBe(userData);

      // Parse and verify structure
      const parsedUserData = JSON.parse(cachedData!);
      expect(parsedUserData.id).toBe(userId);
      expect(parsedUserData.email).toBe('test@example.com');

      // Clean up
      await cacheService.delete(cacheKey);
    }, 15000);

    it('should handle pattern-based cache operations', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      const baseKey = 'connected_user:';

      // Create multiple user cache entries
      for (const userId of userIds) {
        const cacheKey = `${baseKey}${userId}`;
        const userData = JSON.stringify({
          id: userId,
          email: `${userId}@example.com`,
          name: `User ${userId}`,
        });
        await cacheService.set(cacheKey, userData, 300);
      }

      // Verify all keys exist
      for (const userId of userIds) {
        const exists = await cacheService.exists(`${baseKey}${userId}`);
        expect(exists).toBe(true);
      }

      // Clean up using pattern deletion
      await cacheService.deletePattern(`${baseKey}*`);

      // Verify all keys are deleted
      for (const userId of userIds) {
        const exists = await cacheService.exists(`${baseKey}${userId}`);
        expect(exists).toBe(false);
      }
    }, 15000);
  });
});
