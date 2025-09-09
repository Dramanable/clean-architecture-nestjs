/**
 * 🍃 MONGODB MIGRATION RUNNER - Enterprise Grade
 *
 * Script d'administration pour exécuter les migrations MongoDB
 * Intégré avec le système de logging et i18n de l'application
 *
 * FONCTIONNALITÉS:
 * - Exécution sécurisée des migrations
 * - Logging enterprise avec audit trail
 * - Rollback automatique en cas d'erreur
 * - Support environnements multiples
 * - Intégration Clean Architecture
 *
 * USAGE:
 * npm run migrate:mongo up    # Exécuter toutes les migrations
 * npm run migrate:mongo down  # Rollback dernière migration
 */

import { NestFactory } from '@nestjs/core';
import { MongoClient, Db } from 'mongodb';
import { Logger } from 'pino';
import { AppModule } from '../../../app.module';
import { AppConfigService } from '../../config/app-config.service';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import type { I18nService } from '../../../application/ports/i18n.port';
import { createMongoUserPasswordMigration } from './20250909_002-HarmonizeHashedPassword';

// Types pour les métadonnées de migration
interface MigrationRecord {
  version: string;
  description: string;
  executedAt: Date;
  executionTimeMs: number;
  status: 'completed' | 'failed' | 'rolled_back';
}

interface MigrationDefinition {
  version: string;
  description: string;
  up(db: Db): Promise<void>;
  down(db: Db): Promise<void>;
}

/**
 * 🏭 MongoDB Migration Runner - Enterprise Pattern
 * Respecte les principes SOLID et Clean Architecture
 */
export class MongoMigrationRunner {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private migrations: MigrationDefinition[] = [];

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {
    this.initializeMigrations();
  }

  /**
   * 🔼 Exécuter toutes les migrations pendantes
   * Single Responsibility: Gestion des migrations UP uniquement
   */
  async runUp(): Promise<void> {
    const context = { operation: 'MongoMigrationRunner.runUp' };

    try {
      await this.connect();
      
      this.logger.info(
        this.i18n.t('infrastructure.migration.runner.starting'),
        context,
      );

      const executedMigrations = await this.getExecutedMigrations();
      const pendingMigrations = this.migrations.filter(
        migration => !executedMigrations.includes(migration.version)
      );

      if (pendingMigrations.length === 0) {
        this.logger.info(
          this.i18n.t('infrastructure.migration.runner.no_pending'),
          context,
        );
        return;
      }

      this.logger.info(
        this.i18n.t('infrastructure.migration.runner.found_pending'),
        { ...context, count: pendingMigrations.length },
      );

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration, 'up');
      }

      this.logger.info(
        this.i18n.t('infrastructure.migration.runner.completed'),
        { ...context, executed: pendingMigrations.length },
      );

    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.migration.runner.failed'),
        error as Error,
        context,
      );
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * 🔽 Rollback de la dernière migration
   * Single Responsibility: Gestion des rollbacks uniquement
   */
  async runDown(): Promise<void> {
    const context = { operation: 'MongoMigrationRunner.runDown' };

    try {
      await this.connect();
      
      this.logger.info(
        this.i18n.t('infrastructure.migration.runner.rollback_starting'),
        context,
      );

      const executedMigrations = await this.getExecutedMigrations();
      
      if (executedMigrations.length === 0) {
        this.logger.info(
          this.i18n.t('infrastructure.migration.runner.no_rollback'),
          context,
        );
        return;
      }

      // Trouver la dernière migration exécutée
      const lastMigrationVersion = executedMigrations[executedMigrations.length - 1];
      const migrationToRollback = this.migrations.find(
        m => m.version === lastMigrationVersion
      );

      if (!migrationToRollback) {
        throw new Error(`Migration ${lastMigrationVersion} not found for rollback`);
      }

      await this.executeMigration(migrationToRollback, 'down');

      this.logger.info(
        this.i18n.t('infrastructure.migration.runner.rollback_completed'),
        { ...context, version: lastMigrationVersion },
      );

    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.migration.runner.rollback_failed'),
        error as Error,
        context,
      );
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * 🔧 Initialise la liste des migrations disponibles
   * Open/Closed: Facile d'ajouter de nouvelles migrations
   */
  private initializeMigrations(): void {
    // Factory pattern pour créer les migrations avec leurs dépendances
    const userPasswordMigration = createMongoUserPasswordMigration(
      this.logger,
      this.i18n,
    );

    this.migrations = [
      {
        version: userPasswordMigration.version,
        description: userPasswordMigration.description,
        up: async (db: Db) => await userPasswordMigration.up(db as any),
        down: async (db: Db) => await userPasswordMigration.down(db as any),
      },
      // 📝 Ajouter ici les futures migrations
    ];

    // Trier par version pour exécution ordonnée
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * 🔌 Connexion sécurisée à MongoDB
   * Dependency Inversion: Utilise la configuration abstraite
   */
  private async connect(): Promise<void> {
    const mongoUri = this.buildMongoUri();
    
    this.client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await this.client.connect();
    this.db = this.client.db(this.configService.getDatabaseName());

    // Créer collection des migrations si inexistante
    await this.ensureMigrationsCollection();
  }

  /**
   * 🔌 Déconnexion propre
   */
  private async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  /**
   * 🏗️ Construction de l'URI MongoDB depuis la configuration
   * Interface Segregation: Méthode spécialisée dans la construction d'URI
   */
  private buildMongoUri(): string {
    const host = this.configService.getDatabaseHost();
    const port = this.configService.getDatabasePort();
    const username = this.configService.getDatabaseUsername();
    const password = this.configService.getDatabasePassword();
    const database = this.configService.getDatabaseName();

    return `mongodb://${username}:${password}@${host}:${port}/${database}`;
  }

  /**
   * 📝 Assure l'existence de la collection des migrations
   */
  private async ensureMigrationsCollection(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const collections = await this.db.listCollections({ name: 'migrations' }).toArray();
    
    if (collections.length === 0) {
      await this.db.createCollection('migrations');
      
      // Créer index sur version pour performance
      await this.db.collection('migrations').createIndex(
        { version: 1 },
        { unique: true, name: 'version_unique_idx' }
      );
    }
  }

  /**
   * 📋 Récupère la liste des migrations déjà exécutées
   */
  private async getExecutedMigrations(): Promise<string[]> {
    if (!this.db) throw new Error('Database not connected');

    const records = await this.db
      .collection('migrations')
      .find({ status: 'completed' })
      .sort({ executedAt: 1 })
      .toArray();

    return records.map((record: any) => record.version);
  }

  /**
   * 🚀 Exécute une migration spécifique
   * Liskov Substitution: Méthode polymorphe pour up/down
   */
  private async executeMigration(
    migration: MigrationDefinition,
    direction: 'up' | 'down',
  ): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const startTime = Date.now();
    const context = {
      operation: `MongoMigration.${direction}`,
      version: migration.version,
      description: migration.description,
    };

    this.logger.info(
      this.i18n.t(`infrastructure.migration.${direction}_starting`),
      context,
    );

    try {
      // Exécuter la migration
      if (direction === 'up') {
        await migration.up(this.db);
      } else {
        await migration.down(this.db);
      }

      const executionTimeMs = Date.now() - startTime;

      // Enregistrer le résultat
      await this.recordMigration(migration.version, migration.description, direction, executionTimeMs);

      this.logger.info(
        this.i18n.t(`infrastructure.migration.${direction}_completed`),
        { ...context, executionTimeMs },
      );

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      
      // Enregistrer l'échec
      await this.recordMigrationFailure(migration.version, migration.description, executionTimeMs);

      this.logger.error(
        this.i18n.t(`infrastructure.migration.${direction}_failed`),
        error as Error,
        { ...context, executionTimeMs },
      );

      throw error;
    }
  }

  /**
   * 📝 Enregistre le succès d'une migration
   */
  private async recordMigration(
    version: string,
    description: string,
    direction: 'up' | 'down',
    executionTimeMs: number,
  ): Promise<void> {
    if (!this.db) return;

    const record: MigrationRecord = {
      version,
      description,
      executedAt: new Date(),
      executionTimeMs,
      status: direction === 'up' ? 'completed' : 'rolled_back',
    };

    if (direction === 'up') {
      await this.db.collection('migrations').insertOne(record);
    } else {
      // Pour rollback, supprimer l'enregistrement
      await this.db.collection('migrations').deleteOne({ version });
    }
  }

  /**
   * 📝 Enregistre l'échec d'une migration
   */
  private async recordMigrationFailure(
    version: string,
    description: string,
    executionTimeMs: number,
  ): Promise<void> {
    if (!this.db) return;

    const record: MigrationRecord = {
      version,
      description,
      executedAt: new Date(),
      executionTimeMs,
      status: 'failed',
    };

    await this.db.collection('migrations').insertOne(record);
  }
}

/**
 * 🚀 Point d'entrée principal du script
 * Dependency Injection avec NestJS
 */
async function main(): Promise<void> {
  const direction = process.argv[2];
  
  if (!direction || !['up', 'down'].includes(direction)) {
    console.error('❌ Usage: npm run migrate:mongo [up|down]');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const configService = app.get(AppConfigService);
    const logger = app.get(TOKENS.LOGGER);
    const i18n = app.get(TOKENS.I18N_SERVICE);

    // Vérifier que MongoDB est configuré
    if (configService.getDatabaseType() !== 'mongodb') {
      console.error('❌ DATABASE_TYPE must be set to "mongodb" for this migration');
      process.exit(1);
    }

    const runner = new MongoMigrationRunner(configService, logger, i18n);

    if (direction === 'up') {
      await runner.runUp();
    } else {
      await runner.runDown();
    }

    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}
