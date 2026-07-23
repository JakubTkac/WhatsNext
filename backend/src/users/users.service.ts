import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  displayName: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      return await this.userRepository.save(
        this.userRepository.create({
          email: input.email,
          passwordHash: input.passwordHash,
          displayName: input.displayName,
          bio: null,
          avatarUrl: null,
        }),
      );
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('An account with this email already exists.');
      }

      throw error;
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  return (error.driverError as { code?: string }).code === '23505';
}
