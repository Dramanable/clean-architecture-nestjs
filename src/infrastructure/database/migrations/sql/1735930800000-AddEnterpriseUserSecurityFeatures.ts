/**
 * 🔧 MIGRATION SQL - Add Enterprise User Security Features
 *
 * Migration SQL qui ajoute des fonctionnalités de sécurité enterprise
 * aux utilisateurs existants avec hashedPassword
 *
 * FONCTIONNALITÉS:
 * - Colonnes audit trail (last_login_at, failed_login_attempts)
 * - Colonnes sécurité (account_locked_until, password_updated_at)
 * - Index optimisés pour performance et sécurité
 * - Contraintes de sécurité enterprise
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * - Migration d'infrastructure pure
 * - Respect des principes SOLID
 * - Rollback sécurisé complet
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnterpriseUserSecurityFeatures1735930800000
  implements MigrationInterface
{
  name = 'AddEnterpriseUserSecurityFeatures1735930800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔼 Starting Enterprise User Security Features migration...');

    try {
      // 1. 🔐 Ajouter colonnes de sécurité enterprise
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD COLUMN "lastLoginAt" TIMESTAMP NULL,
        ADD COLUMN "failedLoginAttempts" INTEGER DEFAULT 0 NOT NULL,
        ADD COLUMN "accountLockedUntil" TIMESTAMP NULL,
        ADD COLUMN "passwordUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ADD COLUMN "requiresPasswordChange" BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN "twoFactorSecret" VARCHAR(255) NULL
      `);

      // 2. 📊 Créer index composé pour audit et sécurité
      await queryRunner.query(`
        CREATE INDEX "IDX_USER_SECURITY_STATUS" 
        ON "users" ("isActive", "accountLockedUntil", "failedLoginAttempts")
      `);

      // 3. 🔍 Index pour recherche par dernière connexion
      await queryRunner.query(`
        CREATE INDEX "IDX_USER_LAST_LOGIN" 
        ON "users" ("lastLoginAt" DESC) 
        WHERE "lastLoginAt" IS NOT NULL
      `);

      // 4. ⚡ Index pour les utilisateurs actifs récents (performance)
      await queryRunner.query(`
        CREATE INDEX "IDX_USER_ACTIVE_RECENT" 
        ON "users" ("isActive", "lastLoginAt" DESC, "role") 
        WHERE "isActive" = true
      `);

      // 5. 🔐 Index pour passwords expirants (sécurité)
      await queryRunner.query(`
        CREATE INDEX "IDX_USER_PASSWORD_EXPIRY" 
        ON "users" ("passwordUpdatedAt", "requiresPasswordChange", "role")
      `);

      // 6. 🚨 Contrainte de sécurité: Limiter tentatives de connexion
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD CONSTRAINT "CHK_FAILED_LOGIN_ATTEMPTS" 
        CHECK ("failedLoginAttempts" >= 0 AND "failedLoginAttempts" <= 10)
      `);

      // 7. 📝 Contrainte: 2FA secret seulement si 2FA activé
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD CONSTRAINT "CHK_TWO_FACTOR_CONSISTENCY" 
        CHECK (
          ("twoFactorEnabled" = false AND "twoFactorSecret" IS NULL) OR
          ("twoFactorEnabled" = true AND "twoFactorSecret" IS NOT NULL)
        )
      `);

      // 8. 🎯 Mise à jour des utilisateurs existants
      await queryRunner.query(`
        UPDATE "users" 
        SET "passwordUpdatedAt" = "createdAt"
        WHERE "passwordUpdatedAt" IS NULL
      `);

      console.log(
        '✅ Enterprise User Security Features migration completed successfully',
      );
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '🔽 Rolling back Enterprise User Security Features migration...',
    );

    try {
      // 1. 🗑️ Supprimer les contraintes (ordre inverse de création)
      await queryRunner.query(`
        ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "CHK_TWO_FACTOR_CONSISTENCY"
      `);

      await queryRunner.query(`
        ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "CHK_FAILED_LOGIN_ATTEMPTS"
      `);

      // 2. 🗑️ Supprimer les index (ordre inverse de création)
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_USER_PASSWORD_EXPIRY"`,
      );
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_ACTIVE_RECENT"`);
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_LAST_LOGIN"`);
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_USER_SECURITY_STATUS"`,
      );

      // 3. 🗑️ Supprimer les colonnes (ordre inverse de création)
      await queryRunner.query(`
        ALTER TABLE "users" 
        DROP COLUMN IF EXISTS "twoFactorSecret",
        DROP COLUMN IF EXISTS "twoFactorEnabled",
        DROP COLUMN IF EXISTS "requiresPasswordChange",
        DROP COLUMN IF EXISTS "passwordUpdatedAt",
        DROP COLUMN IF EXISTS "accountLockedUntil",
        DROP COLUMN IF EXISTS "failedLoginAttempts",
        DROP COLUMN IF EXISTS "lastLoginAt"
      `);

      console.log(
        '⏪ Enterprise User Security Features rollback completed successfully',
      );
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}
