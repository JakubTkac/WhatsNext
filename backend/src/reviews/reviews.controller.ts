import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Public } from '../common/decorators/public.decorator';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';
import { EligibleReviewMoviesResponseDto } from './dto/eligible-review-movies-response.dto';
import { LatestReviewDto } from './dto/latest-review.dto';
import { LatestReviewsQueryDto } from './dto/latest-reviews-query.dto';
import { LatestReviewsResponseDto } from './dto/latest-reviews-response.dto';
import { ReviewIdParamDto } from './dto/review-id-param.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { ReviewsResponseDto } from './dto/reviews-response.dto';
import { UpdateReviewRequestDto } from './dto/update-review-request.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Browse movie reviews',
    description:
      'Returns public reviews ordered from newest to oldest with optional movie-title, movie-slug, and rating filters.',
  })
  @ApiOkResponse({
    description: 'Review page returned successfully.',
    type: ReviewsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'One or more review filters failed validation.',
  })
  findAll(@Query() query: ReviewsQueryDto): Promise<ReviewsResponseDto> {
    return this.reviewsService.findAll(query);
  }

  @Public()
  @Get('latest')
  @ApiOperation({
    summary: 'Get the latest movie reviews',
    description:
      'Returns the newest public reviews with their authors and movies.',
  })
  @ApiOkResponse({
    description: 'Latest reviews returned successfully.',
    type: LatestReviewsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The requested limit failed query validation.',
  })
  findLatest(
    @Query() query: LatestReviewsQueryDto,
  ): Promise<LatestReviewsResponseDto> {
    return this.reviewsService.findLatest(query);
  }

  @Get('mine')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the authenticated user reviews' })
  @ApiOkResponse({
    description: 'Owned review page returned successfully.',
    type: ReviewsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'One or more review filters failed validation.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReviewsQueryDto,
  ): Promise<ReviewsResponseDto> {
    return this.reviewsService.findMine(user.id, query);
  }

  @Get('eligible-movies')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get released movies eligible for a new review',
  })
  @ApiOkResponse({
    description: 'Eligible movies returned successfully.',
    type: EligibleReviewMoviesResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  findEligibleMovies(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EligibleReviewMoviesResponseDto> {
    return this.reviewsService.findEligibleMovies(user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiOkResponse({
    description: 'Review returned successfully.',
    type: LatestReviewDto,
  })
  @ApiBadRequestResponse({ description: 'Review ID is invalid.' })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  findOne(@Param() params: ReviewIdParamDto): Promise<LatestReviewDto> {
    return this.reviewsService.findOne(params.id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a review for a released movie' })
  @ApiCreatedResponse({
    description: 'Review created successfully.',
    type: LatestReviewDto,
  })
  @ApiBadRequestResponse({
    description: 'The movie is unreleased or review data is invalid.',
  })
  @ApiConflictResponse({
    description: 'The user has already reviewed this movie.',
  })
  @ApiNotFoundResponse({ description: 'Movie not found.' })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateReviewRequestDto,
  ): Promise<LatestReviewDto> {
    return this.reviewsService.create(user, request);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an owned review' })
  @ApiOkResponse({
    description: 'Review updated successfully.',
    type: LatestReviewDto,
  })
  @ApiBadRequestResponse({
    description: 'Review ID or review data is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'The review belongs to another user.',
  })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: ReviewIdParamDto,
    @Body() request: UpdateReviewRequestDto,
  ): Promise<LatestReviewDto> {
    return this.reviewsService.update(user, params.id, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete an owned review' })
  @ApiNoContentResponse({ description: 'Review deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Review ID is invalid.' })
  @ApiNotFoundResponse({
    description: 'Owned review not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing or invalid.',
  })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: ReviewIdParamDto,
  ): Promise<void> {
    return this.reviewsService.remove(user.id, params.id);
  }
}
