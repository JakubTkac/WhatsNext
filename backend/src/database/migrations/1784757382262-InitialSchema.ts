import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1784757382262 implements MigrationInterface {
  name = 'InitialSchema1784757382262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "watchlist_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "movie_id" uuid NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "watched_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0a02323c5cc02e094871f24062b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_watchlist_items_movie_id" ON "watchlist_items"  ("movie_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_watchlist_items_user_movie" ON "watchlist_items"  ("user_id", "movie_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(254) NOT NULL, "password_hash" character varying NOT NULL, "display_name" character varying(100) NOT NULL, "bio" text, "avatar_url" character varying(2048), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_users_email_normalized" CHECK ("email" = lower(btrim("email"))), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_email" ON "users"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "movie_id" uuid NOT NULL, "rating" smallint NOT NULL, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_reviews_rating" CHECK ("rating" BETWEEN 1 AND 10), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_movie_id" ON "reviews"  ("movie_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_reviews_user_movie" ON "reviews"  ("user_id", "movie_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "movies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text NOT NULL, "release_date" date NOT NULL, "runtime_minutes" integer, "poster_url" character varying(2048), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_movies_runtime_minutes" CHECK ("runtime_minutes" IS NULL OR "runtime_minutes" > 0), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_movies_release_date" ON "movies"  ("release_date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_movies_slug" ON "movies"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "genres" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_genres_slug" ON "genres"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_genres_name" ON "genres"  ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "movie_genres" ("movie_id" uuid NOT NULL, "genre_id" uuid NOT NULL, CONSTRAINT "PK_ec45eae1bc95d1461ad55713ffc" PRIMARY KEY ("movie_id", "genre_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae967ce58ef99e9ff3933ccea4" ON "movie_genres"  ("movie_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbbc12542564f7ff56e36f5bbf" ON "movie_genres"  ("genre_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_items" ADD CONSTRAINT "FK_watchlist_items_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_items" ADD CONSTRAINT "FK_watchlist_items_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_movie_genres_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_movie_genres_genre" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_movie_genres_genre"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_movie_genres_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_items" DROP CONSTRAINT "FK_watchlist_items_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_items" DROP CONSTRAINT "FK_watchlist_items_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbbc12542564f7ff56e36f5bbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae967ce58ef99e9ff3933ccea4"`,
    );
    await queryRunner.query(`DROP TABLE "movie_genres"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_genres_name"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_genres_slug"`);
    await queryRunner.query(`DROP TABLE "genres"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_movies_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_movies_release_date"`);
    await queryRunner.query(`DROP TABLE "movies"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_reviews_user_movie"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_movie_id"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_watchlist_items_user_movie"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_watchlist_items_movie_id"`,
    );
    await queryRunner.query(`DROP TABLE "watchlist_items"`);
  }
}
