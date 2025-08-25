/**
 * 🍃 MongoDB Migration Configuration
 *
 * Configuration pour les migrations MongoDB avec Mongoose
 * Gère les changements de schéma et les transformations de données NoSQL
 */

import { config } from 'dotenv';
import { connect } from 'mongoose';

// Charger les variables d'environnement
config();

export interface MongoMigration {
  version: number;
  name: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

export class MongoMigrationRunner {
  private connectionString: string;

  constructor() {
    this.connectionString = this.buildConnectionString();
  }

  private buildConnectionString(): string {
    const host = process.env.DATABASE_HOST || 'localhost';
    const port = process.env.DATABASE_PORT || '27017';
    const username = process.env.DATABASE_USERNAME || 'admin';
    const password = process.env.DATABASE_PASSWORD || 'password123';
    const database = process.env.DATABASE_NAME || 'cleanarchi';

    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
  }

  async connect(): Promise<void> {
    try {
      await connect(this.connectionString);
      console.log('✅ MongoDB connected for migrations');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('🔌 MongoDB disconnected');
  }

  async runMigrations(migrations: MongoMigration[]): Promise<void> {
    await this.connect();

    try {
      // Créer collection pour tracker les migrations
      const mongoose = await import('mongoose');
      const MigrationSchema = new mongoose.Schema({
        version: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        appliedAt: { type: Date, default: Date.now },
      });

      const MigrationModel = mongoose.model(
        'nosql_migrations_history',
        MigrationSchema,
      );

      // Obtenir les migrations déjà appliquées
      const appliedMigrations = await MigrationModel.find().sort({
        version: 1,
      });
      const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

      // Appliquer les nouvelles migrations
      for (const migration of migrations.sort(
        (a, b) => a.version - b.version,
      )) {
        if (!appliedVersions.has(migration.version)) {
          console.log(`🔄 Applying migration: ${migration.name}`);

          try {
            await migration.up();

            // Enregistrer la migration comme appliquée
            await MigrationModel.create({
              version: migration.version,
              name: migration.name,
            });

            console.log(`✅ Migration ${migration.name} applied successfully`);
          } catch (error) {
            console.error(`❌ Migration ${migration.name} failed:`, error);
            throw error;
          }
        } else {
          console.log(`⏭️ Migration ${migration.name} already applied`);
        }
      }
    } finally {
      await this.disconnect();
    }
  }

  async revertLastMigration(migrations: MongoMigration[]): Promise<void> {
    await this.connect();

    try {
      const mongoose = await import('mongoose');
      const MigrationSchema = new mongoose.Schema({
        version: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        appliedAt: { type: Date, default: Date.now },
      });

      const MigrationModel = mongoose.model(
        'nosql_migrations_history',
        MigrationSchema,
      );

      // Obtenir la dernière migration appliquée
      const lastMigration = await MigrationModel.findOne().sort({
        version: -1,
      });

      if (!lastMigration) {
        console.log('ℹ️ No migrations to revert');
        return;
      }

      // Trouver la migration correspondante
      const migration = migrations.find(
        (m) => m.version === lastMigration.version,
      );

      if (!migration) {
        throw new Error(
          `Migration ${lastMigration.name} not found in migration files`,
        );
      }

      console.log(`🔄 Reverting migration: ${migration.name}`);

      try {
        await migration.down();

        // Supprimer l'entrée de la migration
        await MigrationModel.deleteOne({ version: migration.version });

        console.log(`✅ Migration ${migration.name} reverted successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} revert failed:`, error);
        throw error;
      }
    } finally {
      await this.disconnect();
    }
  }
}
