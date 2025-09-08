#!/usr/bin/env ts-node

/**
 * 🌱 Database Seeder - 15 Utilisateurs de Test
 * 
 * Script pour populer la base de données avec des utilisateurs de test
 * avec différentes langues (fr/en) et rôles
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserOrmEntity } from '../src/infrastructure/database/entities/typeorm/user.entity';
import { RefreshTokenOrmEntity } from '../src/infrastructure/database/entities/typeorm/refresh-token.entity';
import { UserRole } from '../src/shared/enums/user-role.enum';

// Charger les variables d'environnement
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'cleanarchi_dev',
  entities: [UserOrmEntity, RefreshTokenOrmEntity],
  synchronize: false,
  logging: true,
});

interface UserSeedData {
  email: string;
  name: string;
  role: UserRole;
  language: 'fr' | 'en';
  password: string;
}

const seedUsers: UserSeedData[] = [
  // Super Admins (2)
  {
    email: 'admin@cleanarchi.com',
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'superadmin@cleanarchi.com',
    name: 'Super Administrator',
    role: UserRole.SUPER_ADMIN,
    language: 'en',
    password: 'amadou',
  },

  // Managers (4)
  {
    email: 'manager.fr@cleanarchi.com',
    name: 'Manager Français',
    role: UserRole.MANAGER,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'manager.en@cleanarchi.com',
    name: 'English Manager',
    role: UserRole.MANAGER,
    language: 'en',
    password: 'amadou',
  },
  {
    email: 'team.lead@cleanarchi.com',
    name: "Chef d'Équipe",
    role: UserRole.MANAGER,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'project.manager@cleanarchi.com',
    name: 'Project Manager',
    role: UserRole.MANAGER,
    language: 'en',
    password: 'amadou',
  },

  // Users (9)
  {
    email: 'user.fr1@cleanarchi.com',
    name: 'Utilisateur Français 1',
    role: UserRole.USER,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'user.fr2@cleanarchi.com',
    name: 'Utilisateur Français 2',
    role: UserRole.USER,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'user.fr3@cleanarchi.com',
    name: 'Utilisateur Français 3',
    role: UserRole.USER,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'user.en1@cleanarchi.com',
    name: 'English User 1',
    role: UserRole.USER,
    language: 'en',
    password: 'amadou',
  },
  {
    email: 'user.en2@cleanarchi.com',
    name: 'English User 2',
    role: UserRole.USER,
    language: 'en',
    password: 'amadou',
  },
  {
    email: 'user.en3@cleanarchi.com',
    name: 'English User 3',
    role: UserRole.USER,
    language: 'en',
    password: 'amadou',
  },
  {
    email: 'developer@cleanarchi.com',
    name: 'Développeur',
    role: UserRole.USER,
    language: 'fr',
    password: 'amadou',
  },
  {
    email: 'designer@cleanarchi.com',
    name: 'Designer',
    role: UserRole.USER,
    language: 'en',
    password: 'amadou',
  },
  {
    email: 'analyst@cleanarchi.com',
    name: 'Analyste',
    role: UserRole.USER,
    language: 'fr',
    password: 'amadou',
  },
];

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function seedDatabase(): Promise<void> {
  try {
    console.log('🔌 Connexion à la base de données...');
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(UserOrmEntity);

    console.log('🌱 Début du seeding des utilisateurs...');

    for (const [index, userData] of seedUsers.entries()) {
      console.log(`👤 Création de l'utilisateur ${index + 1}/15: ${userData.email}`);

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`   ⚠️  L'utilisateur ${userData.email} existe déjà, passage au suivant`);
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await hashPassword(userData.password);

      // Créer l'utilisateur
      const user = new UserOrmEntity();
      user.email = userData.email;
      user.name = userData.name;
      user.role = userData.role;
      user.hashedPassword = hashedPassword;
      user.isActive = true;
      user.emailVerified = true;
      user.passwordChangeRequired = false;
      user.loginAttempts = 0;

      await userRepository.save(user);
      console.log(`   ✅ Utilisateur ${userData.email} créé avec succès`);
    }

    console.log('🎉 Seeding terminé avec succès !');
    console.log('\n📊 Statistiques des utilisateurs créés :');
    console.log(`   • Super Admins: 2`);
    console.log(`   • Managers: 4`);
    console.log(`   • Users: 9`);
    console.log(`   • Français: ${seedUsers.filter(u => u.language === 'fr').length}`);
    console.log(`   • Anglais: ${seedUsers.filter(u => u.language === 'en').length}`);
    console.log('\n🔑 Mots de passe par défaut :');
    console.log('   • Super Admins: admin123 / superadmin123');
    console.log('   • Managers: manager123 / teamlead123 / project123');
    console.log('   • Users: user123 / dev123 / design123 / analyst123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter le script uniquement si appelé directement
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase, seedUsers };
