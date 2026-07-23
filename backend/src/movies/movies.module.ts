import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from '../genres/entities/genre.entity';
import { ReviewsModule } from '../reviews/reviews.module';
import { Movie } from './entities/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesRepository } from './movies.repository';
import { MoviesService } from './movies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre]), ReviewsModule],
  controllers: [MoviesController],
  providers: [MoviesRepository, MoviesService],
})
export class MoviesModule {}
