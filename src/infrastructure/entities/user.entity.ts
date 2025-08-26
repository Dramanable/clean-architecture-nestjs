import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../shared/enums/user-role.enum';

/**
 * 🗄️ INFRASTRUCTURE ENTITY - User TypeORM Entity
 *
 * Entité infrastructure pour la persistance en base de données
 * Mapping direct avec la table users
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'hashed_password', nullable: true })
  hashedPassword?: string;

  @Column({ name: 'password_change_required', default: false })
  passwordChangeRequired: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
