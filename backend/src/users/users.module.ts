import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../reviews/entities/review.entity';
import { WatchlistItem } from '../watchlist/entities/watchlist-item.entity';
import { User } from './entities/user.entity';
import { UserAvatarsController } from './user-avatars.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Review, WatchlistItem])],
  controllers: [UsersController, UserAvatarsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
