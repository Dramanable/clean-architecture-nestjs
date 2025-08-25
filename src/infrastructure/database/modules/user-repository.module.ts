/**
 * 🏗️ INFRASTRUCTURE - User Repository Module
 *
 * Module NestJS pour l'injection de dépendances du repository utilisateur
 * Intégration TypeORM + i18n + logging selon Clean Architecture
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
import { UserMapper } from '../mappers/typeorm-user.mapper';
import { TypeOrmUserRepository } from '../repositories/typeorm-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    TypeOrmUserRepository,
    UserMapper,
    // Logger et I18nService seront injectés automatiquement
    // par le système de DI de NestJS s'ils sont configurés globalement
  ],
  exports: [TypeOrmUserRepository, UserMapper],
})
export class UserRepositoryModule {}
