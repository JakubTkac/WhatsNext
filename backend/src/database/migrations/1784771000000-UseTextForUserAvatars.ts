import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseTextForUserAvatars1784771000000
  implements MigrationInterface
{
  name = 'UseTextForUserAvatars1784771000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "avatar_url" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "users" SET "avatar_url" = NULL WHERE length("avatar_url") > 2048`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "avatar_url" TYPE character varying(2048)`,
    );
  }
}
