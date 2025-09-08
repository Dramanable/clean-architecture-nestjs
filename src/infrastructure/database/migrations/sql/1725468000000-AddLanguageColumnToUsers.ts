import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLanguageColumnToUsers1725468000000
  implements MigrationInterface
{
  name = 'AddLanguageColumnToUsers1725468000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne language existe déjà
    const result = (await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'language'
      AND table_schema = 'public'
    `)) as Array<{ column_name: string }>;

    // Si la colonne n'existe pas, l'ajouter
    if (result.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD COLUMN "language" varchar(2) DEFAULT 'fr' NOT NULL
      `);

      // Ajouter une contrainte CHECK pour valider les valeurs
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD CONSTRAINT "CHK_users_language" 
        CHECK ("language" IN ('fr', 'en'))
      `);

      console.log('✅ Column "language" added to users table');
    } else {
      console.log('ℹ️ Column "language" already exists in users table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la contrainte existe avant de la supprimer
    const constraintResult = (await queryRunner.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
      AND constraint_name = 'CHK_users_language'
      AND table_schema = 'public'
    `)) as Array<{ constraint_name: string }>;

    if (constraintResult.length > 0) {
      await queryRunner.query(`
        ALTER TABLE "users" DROP CONSTRAINT "CHK_users_language"
      `);
    }

    // Vérifier si la colonne existe avant de la supprimer
    const columnResult = (await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'language'
      AND table_schema = 'public'
    `)) as Array<{ column_name: string }>;

    if (columnResult.length > 0) {
      await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "language"
      `);
    }
  }
}
