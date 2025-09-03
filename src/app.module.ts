import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [
    // 🔧 Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      expandVariables: true,
    }),

    // 🛡️ Sécurité globale (guards, authentification)
    SecurityModule,

    // 🗄️ Configuration base de données
    DatabaseModule.forRoot(),

    // 🎨 Module de présentation (inclut infrastructure)
    PresentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
