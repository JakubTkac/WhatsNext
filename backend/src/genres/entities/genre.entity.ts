import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

@Entity({ name: 'genres' })
@Index('UQ_genres_name', ['name'], { unique: true })
@Index('UQ_genres_slug', ['slug'], { unique: true })
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  slug!: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies!: Relation<Movie[]>;
}
