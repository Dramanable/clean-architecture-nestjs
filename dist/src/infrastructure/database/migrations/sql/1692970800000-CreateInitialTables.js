"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInitialTables1692970800000 = void 0;
const typeorm_1 = require("typeorm");
class CreateInitialTables1692970800000 {
    name = 'CreateInitialTables1692970800000';
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'password',
                    type: 'varchar',
                    length: '255',
                    isNullable: false,
                },
                {
                    name: 'passwordChangeRequired',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['USER', 'MANAGER', 'SUPER_ADMIN'],
                    default: "'USER'",
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'lastLoginAt',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'lastLoginIp',
                    type: 'varchar',
                    length: '45',
                    isNullable: true,
                },
                {
                    name: 'loginAttempts',
                    type: 'integer',
                    default: 0,
                },
                {
                    name: 'lockedUntil',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'emailVerified',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'emailVerifiedAt',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'emailVerificationToken',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'passwordResetToken',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'passwordResetExpires',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'tenantId',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                },
                {
                    name: 'metadata',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'version',
                    type: 'integer',
                    default: 1,
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'refresh_tokens',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()',
                },
                {
                    name: 'userId',
                    type: 'uuid',
                    isNullable: false,
                },
                {
                    name: 'tokenHash',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'expiresAt',
                    type: 'timestamp with time zone',
                    isNullable: false,
                },
                {
                    name: 'isRevoked',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'deviceId',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'userAgent',
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                },
                {
                    name: 'ipAddress',
                    type: 'inet',
                    isNullable: true,
                },
                {
                    name: 'lastUsedAt',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'revokedAt',
                    type: 'timestamp with time zone',
                    isNullable: true,
                },
                {
                    name: 'revokedReason',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
            ],
        }), true);
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_USER_EMAIL',
            columnNames: ['email'],
            isUnique: true,
        }));
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_USER_ROLE',
            columnNames: ['role'],
        }));
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_USER_CREATED_AT',
            columnNames: ['createdAt'],
        }));
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_USER_TENANT_ID',
            columnNames: ['tenantId'],
        }));
        await queryRunner.createIndex('refresh_tokens', new typeorm_1.TableIndex({
            name: 'IDX_REFRESH_TOKEN_USER_ID',
            columnNames: ['userId'],
        }));
        await queryRunner.createIndex('refresh_tokens', new typeorm_1.TableIndex({
            name: 'IDX_REFRESH_TOKEN_EXPIRES_AT',
            columnNames: ['expiresAt'],
        }));
        await queryRunner.createIndex('refresh_tokens', new typeorm_1.TableIndex({
            name: 'IDX_REFRESH_TOKEN_DEVICE_ID',
            columnNames: ['deviceId'],
        }));
        await queryRunner.query(`
      ALTER TABLE "refresh_tokens" 
      ADD CONSTRAINT "FK_REFRESH_TOKEN_USER" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
        await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
        await queryRunner.query(`
      CREATE TRIGGER update_refresh_tokens_updated_at 
      BEFORE UPDATE ON refresh_tokens 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON refresh_tokens`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_REFRESH_TOKEN_USER"`);
        await queryRunner.dropTable('refresh_tokens');
        await queryRunner.dropTable('users');
    }
}
exports.CreateInitialTables1692970800000 = CreateInitialTables1692970800000;
//# sourceMappingURL=1692970800000-CreateInitialTables.js.map