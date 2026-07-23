import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { WatchlistItem } from '../../watchlist/entities/watchlist-item.entity';

@Entity({ name: 'users' })
@Index('UQ_users_email', ['email'], { unique: true })
@Check('CHK_users_email_normalized', '"email" = lower(btrim("email"))')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 254 })
  email!: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash!: string;

  @Column({ length: 100, name: 'display_name' })
  displayName!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({
    type: 'text',
    name: 'avatar_url',
    nullable: true,
  })
  avatarUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => WatchlistItem, (watchlistItem) => watchlistItem.user)
  watchlistItems!: Relation<WatchlistItem[]>;

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Relation<Review[]>;
}
