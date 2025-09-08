#!/usr/bin/env ts-node

/**
 * 📖 Swagger JSON Generator Script
 *
 * Génère la documentation Swagger/OpenAPI en format JSON
 * sans démarrer le serveur complet.
 *
 * Usage: npm run swagger:generate
 * Output: docs/swagger.json
 */

import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../src/app.module';

async function generateSwaggerJson(): Promise<void> {
  const logger = new Logger('SwaggerGenerator');
  
  try {
    logger.log('🚀 Initializing NestJS application...');
    
    // Créer une instance de l'application NestJS sans démarrer le serveur
    const app: INestApplication = await NestFactory.create(AppModule, {
      logger: false, // Désactiver les logs pour une génération silencieuse
    });

    logger.log('📖 Configuring Swagger documentation...');
    
    // Configuration Swagger identique à celle de production
    const config = new DocumentBuilder()
      .setTitle('User Management API')
      .setDescription(
        'Clean Architecture User Management System with comprehensive features\n\n' +
          'This API provides comprehensive user management capabilities built with Clean Architecture principles:\n' +
          '- 🔐 Authentication & Authorization (JWT + Refresh Tokens)\n' +
          '- 👥 User Management (CRUD, Roles, Permissions)\n' +
          '- 🔑 Password Management (Reset, Change, Security)\n' +
          '- 🏛️ Clean Architecture (Domain, Application, Infrastructure, Presentation)\n' +
          '- 🧪 Full Test Coverage (TDD)\n' +
          '- 🌍 Internationalization (i18n)\n' +
          '- 📊 Audit Trail & Logging\n' +
          '- 🔒 Enterprise Security Features',
      )
      .setVersion('1.0.0')
      .addTag('auth', 'Authentication and authorization endpoints')
      .addTag('users', 'User management operations')
      .addTag('password-reset', 'Password reset and security operations')
      .addTag('health', 'Application health check endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token (format: Bearer <token>)',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for service-to-service authentication',
        },
        'api-key',
      )
      .addServer('http://localhost:3000', 'Development server')
      .addServer('https://api.example.com', 'Production server')
      .addServer('https://staging-api.example.com', 'Staging server')
      .setContact(
        'API Support Team',
        'https://example.com/support',
        'support@example.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .setExternalDoc('Full API Documentation', 'https://docs.example.com/api')
      .build();

    logger.log('🔨 Generating Swagger document...');
    
    // Générer le document Swagger
    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
      deepScanRoutes: true,
    });

    // Ajouter des informations supplémentaires au document
    document.info.contact = {
      name: 'API Support Team',
      url: 'https://example.com/support',
      email: 'support@example.com',
    };

    document.info.license = {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    };

    // Ajouter des extensions personnalisées (avec type assertion pour les extensions x-)
    (document as unknown as Record<string, unknown>)['x-api-version'] = '1.0.0';
    (document as unknown as Record<string, unknown>)['x-build-time'] =
      new Date().toISOString();
    (document as unknown as Record<string, unknown>)['x-architecture'] =
      'Clean Architecture + NestJS';
    (document as unknown as Record<string, unknown>)['x-features'] = [
      'JWT Authentication',
      'Role-Based Access Control',
      'Password Security',
      'Audit Trail',
      'Internationalization',
      'Type Safety',
      'TDD Coverage',
    ];

    logger.log('📁 Creating output directory...');
    
    // Créer le dossier docs s'il n'existe pas
    const docsDir = join(process.cwd(), 'docs');
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    // Écrire le fichier JSON
    const outputPath = join(docsDir, 'swagger.json');
    const jsonContent = JSON.stringify(document, null, 2);
    
    writeFileSync(outputPath, jsonContent, 'utf8');

    logger.log('📊 Generating statistics...');
    
    // Statistiques de génération
    const stats = {
      totalPaths: Object.keys(document.paths || {}).length,
      totalOperations: Object.values(document.paths || {}).reduce(
        (count, pathItem) =>
          count +
          Object.keys(pathItem).filter((key) =>
            ['get', 'post', 'put', 'delete', 'patch'].includes(key),
          ).length,
        0,
      ),
      totalSchemas: Object.keys(document.components?.schemas || {}).length,
      totalTags: (document.tags || []).length,
      generatedAt: new Date().toISOString(),
      fileSize: `${(jsonContent.length / 1024).toFixed(2)} KB`,
    };

    // Écrire également un fichier de statistiques
    const statsPath = join(docsDir, 'swagger-stats.json');
    writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');

    logger.log('✅ Swagger JSON generated successfully!');
    logger.log(`📄 Main file: ${outputPath}`);
    logger.log(`📊 Stats file: ${statsPath}`);
    logger.log(`🔢 Total endpoints: ${stats.totalOperations}`);
    logger.log(`📝 Total schemas: ${stats.totalSchemas}`);
    logger.log(`💾 File size: ${stats.fileSize}`);

    // Fermer l'application
    await app.close();
  } catch (error) {
    logger.error('❌ Failed to generate Swagger JSON:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  generateSwaggerJson()
    .then(() => {
      console.log('🎉 Swagger documentation generated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error generating Swagger documentation:', error);
      process.exit(1);
    });
}

export { generateSwaggerJson };
