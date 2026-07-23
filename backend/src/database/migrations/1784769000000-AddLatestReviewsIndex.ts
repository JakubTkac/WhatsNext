import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLatestReviewsIndex1784769000000
  implements MigrationInterface
{
  name = 'AddLatestReviewsIndex1784769000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_created_at_id" ON "reviews" ("created_at", "id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_created_at_id"`);
  }
}
