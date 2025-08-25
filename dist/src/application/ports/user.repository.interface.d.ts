import { User } from '../../domain/entities/user.entity';
export interface IUserRepository {
    save(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    delete(id: string): Promise<void>;
    existsByEmail(email: string): Promise<boolean>;
    existsByUsername(username: string): Promise<boolean>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
    updateActiveStatus(id: string, isActive: boolean): Promise<void>;
    findMany(options: {
        skip?: number;
        take?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        filters?: {
            role?: string;
            isActive?: boolean;
            searchTerm?: string;
        };
    }): Promise<{
        users: User[];
        total: number;
    }>;
}
