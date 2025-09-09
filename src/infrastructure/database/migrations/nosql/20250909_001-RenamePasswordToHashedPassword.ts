/**
 * 🍃 MONGODB MIGRATION - Rename password to hashedPassword
 *
 * Migration MongoDB qui renomme le champ 'password' en 'hashedPassword'
 * pour respecter la cohérence avec la couche domaine et SQL
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * - Migration d'infrastructure pure
 * - Respecte le nommage de la couche domaine
 * - Maintient la cohérence cross-database
 */

import { Logger } from 'pino';
import { Collection, Db } from 'mongodb';

export interface MongoMigration {
  version: string;
  description: string;
  up(db: Db, logger: Logger): Promise<void>;
  down(db: Db, logger: Logger): Promise<void>;
}

export class RenamePasswordToHashedPasswordMigration implements MongoMigration {
  public readonly version = '20250909_001';
  public readonly description =
    'Rename password field to hashedPassword in users collection';

  /**
   * 🔼 Migration UP: password → hashedPassword
   */
  async up(db: Db, logger: Logger): Promise<void> {
    logger.info(`🔼 [${this.version}] Starting migration: ${this.description}`);

    const usersCollection: Collection = db.collection('users');

    try {
      // 1. Vérifier si la collection existe
      const collections = await db
        .listCollections({ name: 'users' })
        .toArray();
      if (collections.length === 0) {
        logger.info(
          '👻 Users collection does not exist, creating it...',
        );
        await db.createCollection('users');
        logger.info('✅ Users collection created successfully');
        return;
      }

      // 2. Vérifier si le champ 'password' existe
      const sampleDoc = await usersCollection.findOne({
        password: { $exists: true },
      });
      if (!sampleDoc) {
        logger.info(
          '📄 No documents with "password" field found, migration not needed',
        );
        return;
      }

      logger.info(
        '🔍 Found documents with "password" field, proceeding with rename...',
      );

      // 3. Renommer le champ 'password' en 'hashedPassword' pour tous les documents
      const renameResult = await usersCollection.updateMany(
        { password: { $exists: true } },
        { $rename: { password: 'hashedPassword' } },
      );

      logger.info('✅ Renamed password field to hashedPassword');
      logger.info(
        'Migration stats: ' +
          JSON.stringify({
            matchedCount: renameResult.matchedCount,
            modifiedCount: renameResult.modifiedCount,
            upsertedCount: renameResult.upsertedCount,
          }),
      );

      // 4. Vérification post-migration
      const passwordDocsRemaining = await usersCollection.countDocuments({
        password: { $exists: true },
      });
      const hashedPasswordDocs = await usersCollection.countDocuments({
        hashedPassword: { $exists: true },
      });

      if (passwordDocsRemaining > 0) {
        throw new Error(
          `⚠️ Migration incomplete: ${passwordDocsRemaining} documents still have 'password' field`,
        );
      }

      logger.info('🎯 Migration completed successfully');
      logger.info('Final count', {
        documentsWithHashedPassword: hashedPasswordDocs,
        documentsWithPassword: passwordDocsRemaining,
      });

      // 5. Créer index sur hashedPassword si nécessaire (pour sécurité)
      await usersCollection.createIndex(
        { hashedPassword: 1 },
        {
          name: 'hashedPassword_idx',
          background: true,
          sparse: true, // Only documents with hashedPassword
        },
      );

      logger.info('🔐 Created security index on hashedPassword field');
    } catch (error) {
      logger.error(`❌ [${this.version}] Migration failed`);
      logger.error('Error details', error as Error);
      throw error;
    }
  }

  /**
   * 🔽 Migration DOWN: hashedPassword → password (rollback)
   */
  async down(db: Db, logger: Logger): Promise<void> {
    logger.info(`🔽 [${this.version}] Rolling back migration: ${this.description}`);

    const usersCollection: Collection = db.collection('users');

    try {
      // 1. Vérifier si la collection existe
      const collections = await db.listCollections({ name: 'users' }).toArray();
      if (collections.length === 0) {
        logger.info('👻 Users collection does not exist, rollback not needed');
        return;
      }

      // 2. Vérifier si le champ 'hashedPassword' existe
      const sampleDoc = await usersCollection.findOne({ hashedPassword: { $exists: true } });
      if (!sampleDoc) {
        logger.info('📄 No documents with "hashedPassword" field found, rollback not needed');
        return;
      }

      logger.info('🔍 Found documents with "hashedPassword" field, proceeding with rollback...');

      // 3. Renommer le champ 'hashedPassword' en 'password'
      const renameResult = await usersCollection.updateMany(
        { hashedPassword: { $exists: true } },
        { $rename: { hashedPassword: 'password' } }
      );

      logger.info(`✅ Rolled back hashedPassword field to password`, {
        matchedCount: renameResult.matchedCount,
        modifiedCount: renameResult.modifiedCount
      });

      // 4. Supprimer l'index sur hashedPassword
      try {
        await usersCollection.dropIndex('hashedPassword_idx');
        logger.info('🗑️ Dropped hashedPassword index');
      } catch (indexError) {
        logger.warn('⚠️ Could not drop hashedPassword index (may not exist)', indexError);
      }

      // 5. Vérification post-rollback
      const hashedPasswordDocsRemaining = await usersCollection.countDocuments({ 
        hashedPassword: { $exists: true } 
      });
      const passwordDocs = await usersCollection.countDocuments({ 
        password: { $exists: true } 
      });

      if (hashedPasswordDocsRemaining > 0) {
        throw new Error(`⚠️ Rollback incomplete: ${hashedPasswordDocsRemaining} documents still have 'hashedPassword' field`);
      }

      logger.info(`🎯 Rollback completed successfully`, {
        documentsWithPassword: passwordDocs,
        documentsWithHashedPassword: hashedPasswordDocsRemaining
      });

    } catch (error) {
      logger.error(`❌ [${this.version}] Rollback failed`, error);
      throw error;
    }
  }
}

// Export de la migration pour utilisation par le runner
export default new RenamePasswordToHashedPasswordMigration();
