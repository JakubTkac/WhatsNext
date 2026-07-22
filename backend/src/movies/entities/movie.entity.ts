import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Genre } from '../../genres/entities/genre.entity';
import { Review } from '../../reviews/entities/review.entity';
import { WatchlistItem } from '../../watchlist/entities/watchlist-item.entity';

@Entity({ name: 'movies' })
@Index('UQ_movies_slug', ['slug'], { unique: true })
@Index('IDX_movies_release_date', ['releaseDate'])
@Check(
  'CHK_movies_runtime_minutes',
  '"runtime_minutes" IS NULL OR "runtime_minutes" > 0',
)
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255 })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'release_date', type: 'date' })
  releaseDate!: string;

  @Column({ name: 'runtime_minutes', type: 'integer', nullable: true })
  runtimeMinutes!: number | null;

  @Column({
    type: 'varchar',
    length: 2048,
    name: 'poster_url',
    nullable: true,
  })
  posterUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: {
      name: 'movie_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_movie_genres_movie',
    },
    inverseJoinColumn: {
      name: 'genre_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_movie_genres_genre',
    },
  })
  genres!: Relation<Genre[]>;

  @OneToMany(() => WatchlistItem, (watchlistItem) => watchlistItem.movie)
  watchlistItems!: Relation<WatchlistItem[]>;

  @OneToMany(() => Review, (review) => review.movie)
  reviews!: Relation<Review[]>;
}
