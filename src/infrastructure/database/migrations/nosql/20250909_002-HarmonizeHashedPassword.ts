/**
 * 🍃 MONGODB MIGRATION - Harmonisation hashedPassword
 *
 * Migration MongoDB entreprise qui harmonise le champ password → hashedPassword
 * Respecte les standards Clean Architecture + SOLID + TypeScript strict
 *
 * OBJECTIFS:
 * - Cohérence cross-database (SQL ↔ MongoDB)
 * - Respect du nommage de la couche domaine
 * - Migration sécurisée avec rollback
 * - Logging enterprise avec audit trail
 */

import { Logger } from '../../../../application/ports/logger.port';
import type { I18nService } from '../../../../application/ports/i18n.port';

// Types MongoDB (évite dépendance directe)
interface MongoCollection {
  findOne(filter: Record<string, unknown>): Promise<unknown | null>;
  updateMany(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
  ): Promise<{ matchedCount: number; modifiedCount: number }>;
  countDocuments(filter: Record<string, unknown>): Promise<number>;
  createIndex(
    indexSpec: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<void>;
  dropIndex(indexName: string): Promise<void>;
}

interface MongoDatabase {
  collection(name: string): MongoCollection;
  listCollections(filter?: Record<string, unknown>): {
    toArray(): Promise<Array<{ name: string }>>;
  };
  createCollection(name: string): Promise<void>;
}

/**
 * 🏭 Migration Factory Pattern - SOLID Compliant
 */
export class MongoUserPasswordMigration {
  public readonly version = '20250909_002';
  public readonly description = 'Harmonize password → hashedPassword in users collection';

  constructor(
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * 🔼 Migration UP: password → hashedPassword
   * Single Responsibility: Renommage de champ uniquement
   */
  async up(db: MongoDatabase): Promise<void> {
    const context = {
      operation: 'MongoMigration.up',
      version: this.version,
      collection: 'users',
    };

    this.logger.info(
      this.i18n.t('infrastructure.migration.starting'),
      context,
    );

    try {
      const usersCollection = db.collection('users');

      // 1. Vérification existence collection
      const collectionExists = await this.ensureCollectionExists(db);
      if (!collectionExists) {
        this.logger.info(
          this.i18n.t('infrastructure.migration.collection_created'),
          context,
        );
        return;
      }

      // 2. Vérification nécessité migration
      const needsMigration = await this.checkMigrationNeeded(usersCollection);
      if (!needsMigration) {
        this.logger.info(
          this.i18n.t('infrastructure.migration.not_needed'),
          context,
        );
        return;
      }

      // 3. Exécution migration
      const result = await this.executePasswordRename(usersCollection);
      
      // 4. Validation post-migration
      await this.validateMigration(usersCollection);

      // 5. Création index sécurité
      await this.createSecurityIndex(usersCollection);

      this.logger.info(
        this.i18n.t('infrastructure.migration.completed'),
        { ...context, result },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.migration.failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  /**
   * 🔽 Migration DOWN: hashedPassword → password (rollback)
   * Single Responsibility: Rollback uniquement
   */
  async down(db: MongoDatabase): Promise<void> {
    const context = {
      operation: 'MongoMigration.down',
      version: this.version,
      collection: 'users',
    };

    this.logger.info(
      this.i18n.t('infrastructure.migration.rollback_starting'),
      context,
    );

    try {
      const usersCollection = db.collection('users');

      // 1. Vérification collection
      const collections = await db.listCollections().toArray();
      const collectionExists = collections.some(c => c.name === 'users');
      
      if (!collectionExists) {
        this.logger.info(
          this.i18n.t('infrastructure.migration.rollback_not_needed'),
          context,
        );
        return;
      }

      // 2. Exécution rollback
      const result = await this.executeHashedPasswordRename(usersCollection);

      // 3. Nettoyage index
      await this.cleanupSecurityIndex(usersCollection);

      this.logger.info(
        this.i18n.t('infrastructure.migration.rollback_completed'),
        { ...context, result },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.migration.rollback_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  /**
   * 🔧 Assure l'existence de la collection users
   * Open/Closed: Extensible pour autres collections
   */
  private async ensureCollectionExists(db: MongoDatabase): Promise<boolean> {
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection('users');
      return false; // Nouvelle collection, pas de migration nécessaire
    }
    
    return true;
  }

  /**
   * 🔍 Vérifie si la migration est nécessaire
   * Liskov Substitution: Méthode remplaçable par sous-types
   */
  private async checkMigrationNeeded(collection: MongoCollection): Promise<boolean> {
    const sampleDoc = await collection.findOne({ password: { $exists: true } });
    return sampleDoc !== null;
  }

  /**
   * 🔄 Exécute le renommage password → hashedPassword
   * Interface Segregation: Méthode spécialisée
   */
  private async executePasswordRename(collection: MongoCollection): Promise<{
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await collection.updateMany(
      { password: { $exists: true } },
      { $rename: { password: 'hashedPassword' } },
    );
  }

  /**
   * 🔄 Exécute le renommage hashedPassword → password (rollback)
   */
  private async executeHashedPasswordRename(collection: MongoCollection): Promise<{
    matchedCount: number;
    modifiedCount: number;
  }> {
    return await collection.updateMany(
      { hashedPassword: { $exists: true } },
      { $rename: { hashedPassword: 'password' } },
    );
  }

  /**
   * ✅ Valide que la migration s'est bien déroulée
   * Dependency Inversion: Dépend de l'abstraction MongoCollection
   */
  private async validateMigration(collection: MongoCollection): Promise<void> {
    const passwordDocsRemaining = await collection.countDocuments({
      password: { $exists: true },
    });
    
    if (passwordDocsRemaining > 0) {
      throw new Error(
        `Migration validation failed: ${passwordDocsRemaining} documents still have 'password' field`,
      );
    }
  }

  /**
   * 🔐 Crée un index de sécurité sur hashedPassword
   */
  private async createSecurityIndex(collection: MongoCollection): Promise<void> {
    await collection.createIndex(
      { hashedPassword: 1 },
      {
        name: 'hashedPassword_security_idx',
        background: true,
        sparse: true,
      },
    );
  }

  /**
   * 🗑️ Nettoie l'index de sécurité lors du rollback
   */
  private async cleanupSecurityIndex(collection: MongoCollection): Promise<void> {
    try {
      await collection.dropIndex('hashedPassword_security_idx');
    } catch (error) {
      // Index peut ne pas exister, c'est acceptable
      this.logger.warn(
        this.i18n.t('infrastructure.migration.index_cleanup_warning'),
        error as Error,
      );
    }
  }
}

/**
 * 🏭 Factory pour créer la migration avec dépendances
 * Respecte le pattern Dependency Injection
 */
export const createMongoUserPasswordMigration = (
  logger: Logger,
  i18n: I18nService,
): MongoUserPasswordMigration => {
  return new MongoUserPasswordMigration(logger, i18n);
};
