/**
 * 🗄️ INFRASTRUCTURE - TypeORM RefreshToken Entity
 *
 * Entité ORM pour les refresh tokens avec TypeORM
 * Mapping de la table 'refresh_tokens' vers l'entité du domaine
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
@Index('IDX_REFRESH_TOKEN_USER_ID', ['userId'])
@Index('IDX_REFRESH_TOKEN_EXPIRES_AT', ['expiresAt'])
@Index('IDX_REFRESH_TOKEN_DEVICE_ID', ['deviceId'])
export class RefreshTokenOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'text' })
  tokenHash!: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceId?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  revokedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  revokedReason?: string;
}
