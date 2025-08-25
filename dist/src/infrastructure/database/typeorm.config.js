"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const refresh_token_entity_1 = require("./entities/typeorm/refresh-token.entity");
const user_entity_1 = require("./entities/typeorm/user.entity");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'admin',
    password: process.env.DATABASE_PASSWORD || 'password123',
    database: process.env.DATABASE_NAME || 'cleanarchi',
    entities: [user_entity_1.UserOrmEntity, refresh_token_entity_1.RefreshTokenOrmEntity],
    migrations: ['src/infrastructure/database/migrations/sql/*.ts'],
    migrationsTableName: 'sql_migrations_history',
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    extra: {
        connectionLimit: 10,
    },
});
//# sourceMappingURL=typeorm.config.js.map