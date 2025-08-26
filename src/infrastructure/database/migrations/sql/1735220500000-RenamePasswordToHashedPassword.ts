/**
 * 🔧 Migration - Renommer colonne password en hashedPassword
 *
 * Cette migration renomme la colonne 'password' en 'hashedPassword'
 * dans la table users pour être cohérent avec l'entité Domain.
 *
 * SOLID Principle: Single Responsibility - Une migration = un changement
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePasswordToHashedPassword1735220500000
  implements MigrationInterface
{
  name = 'RenamePasswordToHashedPassword1735220500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🔄 Renommer la colonne password en hashedPassword
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "password" TO "hashedPassword"`,
    );

    // 📝 Log de la migration pour audit trail
    console.log('✅ Migration UP: Colonne password renommée en hashedPassword');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 🔄 Rollback: Renommer hashedPassword en password
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "hashedPassword" TO "password"`,
    );

    // 📝 Log du rollback pour audit trail
    console.log(
      '⏪ Migration DOWN: Colonne hashedPassword renommée en password',
    );
  }
}
