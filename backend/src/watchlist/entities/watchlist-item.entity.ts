import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'watchlist_items' })
@Index('UQ_watchlist_items_user_movie', ['userId', 'movieId'], {
  unique: true,
})
@Index('IDX_watchlist_items_movie_id', ['movieId'])
export class WatchlistItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'movie_id', type: 'uuid' })
  movieId!: string;

  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt!: Date;

  @Column({ name: 'watched_at', type: 'timestamptz', nullable: true })
  watchedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.watchlistItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_watchlist_items_user',
  })
  user!: Relation<User>;

  @ManyToOne(() => Movie, (movie) => movie.watchlistItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'movie_id',
    foreignKeyConstraintName: 'FK_watchlist_items_movie',
  })
  movie!: Relation<Movie>;
}
