/**
 * 🔧 TypeORM Configuration pour Migrations
 *
 * Configuration spécifique pour générer et exécuter les migrations
 * Utilise les variables d'environnement pour la connexion DB
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { RefreshTokenOrmEntity } from './entities/typeorm/refresh-token.entity';
import { UserOrmEntity } from './entities/typeorm/user.entity';

// Charger les variables d'environnement
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'admin',
  password: process.env.DATABASE_PASSWORD || 'password123',
  database: process.env.DATABASE_NAME || 'cleanarchi',

  // Entités
  entities: [UserOrmEntity, RefreshTokenOrmEntity],

  // Configuration des migrations
  migrations: ['src/infrastructure/database/migrations/sql/*.ts'],
  migrationsTableName: 'sql_migrations_history',

  // Configuration pour développement
  synchronize: false, // Toujours false avec migrations
  logging: process.env.NODE_ENV !== 'production',

  // Options avancées
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    connectionLimit: 10,
  },
});
