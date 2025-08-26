/**
 * 🗄️ INFRASTRUCTURE - TypeORM User Entity
 *
 * Entité ORM pour PostgreSQL avec TypeORM
 * Mapping de la table 'users' vers l'entité du domaine
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../../shared/enums/user-role.enum';

@Entity('users')
@Index('IDX_USER_EMAIL', ['email'], { unique: true })
@Index('IDX_USER_ROLE', ['role'])
@Index('IDX_USER_CREATED_AT', ['createdAt'])
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'hashedPassword' })
  hashedPassword!: string;

  @Column({ type: 'boolean', default: false })
  passwordChangeRequired!: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // 🔐 Sécurité
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'int', default: 0 })
  loginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  // 📧 Email verification
  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  // 🔑 Password reset
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  // 🏢 Multi-tenant
  @Column({ type: 'varchar', length: 100, nullable: true })
  tenantId?: string;

  // 📊 Métadonnées
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  // 📅 Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 🔒 Optimistic locking
  @Column({ type: 'int', default: 1 })
  version!: number;
}
