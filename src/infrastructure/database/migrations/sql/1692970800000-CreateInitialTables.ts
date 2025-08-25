/**
 * 🗄️ Migration initiale - Tables Users et RefreshTokens
 *
 * Création des tables principales de l'application avec tous les champs
 * et index nécessaires pour la Clean Architecture
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialTables1692970800000 implements MigrationInterface {
  name = 'CreateInitialTables1692970800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 👤 Table USERS
    await queryRunner.createTable(
      new Table({
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
          // 🔐 Champs de sécurité
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
          // 📧 Vérification email
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
          // 🔑 Reset password
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
          // 🏢 Multi-tenant
          {
            name: 'tenantId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          // 📊 Métadonnées
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          // 📅 Timestamps
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
          // 🔒 Optimistic locking
          {
            name: 'version',
            type: 'integer',
            default: 1,
          },
        ],
      }),
      true,
    );

    // 🔑 Table REFRESH_TOKENS
    await queryRunner.createTable(
      new Table({
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
      }),
      true,
    );

    // 📊 Index pour les performances
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_ROLE',
        columnNames: ['role'],
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_TENANT_ID',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_REFRESH_TOKEN_USER_ID',
        columnNames: ['userId'],
      }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_REFRESH_TOKEN_EXPIRES_AT',
        columnNames: ['expiresAt'],
      }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_REFRESH_TOKEN_DEVICE_ID',
        columnNames: ['deviceId'],
      }),
    );

    // 🔗 Foreign Key pour refresh_tokens -> users
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens" 
      ADD CONSTRAINT "FK_REFRESH_TOKEN_USER" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    // 🕐 Trigger pour mettre à jour updatedAt automatiquement
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON refresh_tokens`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Supprimer foreign key
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_REFRESH_TOKEN_USER"`,
    );

    // Supprimer les tables
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('users');
  }
}
