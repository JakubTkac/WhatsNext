import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'reviews' })
@Index('UQ_reviews_user_movie', ['userId', 'movieId'], { unique: true })
@Index('IDX_reviews_movie_id', ['movieId'])
@Index('IDX_reviews_created_at_id', ['createdAt', 'id'])
@Check('CHK_reviews_rating', '"rating" BETWEEN 1 AND 10')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'movie_id', type: 'uuid' })
  movieId!: string;

  @Column({ type: 'smallint' })
  rating!: number;

  @Column({ type: 'text' })
  body!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_reviews_user',
  })
  user!: Relation<User>;

  @ManyToOne(() => Movie, (movie) => movie.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'movie_id',
    foreignKeyConstraintName: 'FK_reviews_movie',
  })
  movie!: Relation<Movie>;
}
