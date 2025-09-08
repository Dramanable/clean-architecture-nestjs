import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLanguageToUsers1693024800000 implements MigrationInterface {
  name = 'AddLanguageToUsers1693024800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne language à la table users existante
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'language',
        type: 'varchar',
        length: '2',
        default: "'fr'",
        isNullable: false,
        comment: 'User preferred language (fr, en)',
      }),
    );

    // Ajouter une contrainte CHECK pour valider les valeurs
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "CHK_users_language" 
      CHECK ("language" IN ('fr', 'en'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la contrainte CHECK
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT "CHK_users_language"
    `);

    // Supprimer la colonne
    await queryRunner.dropColumn('users', 'language');
  }
}
