import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { LatestReviewsQueryDto } from './dto/latest-reviews-query.dto';
import { LatestReviewsResponseDto } from './dto/latest-reviews-response.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

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
}
