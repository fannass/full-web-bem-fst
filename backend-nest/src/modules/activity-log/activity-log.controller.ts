import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtGuard } from '@/common/guards/jwt.guard';

@Controller('api/v1/activity-logs')
@UseGuards(JwtGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    const result = await this.activityLogService.findAll(page, limit);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Delete('clear-old')
  async clearOld(
    @Query('days', new DefaultValuePipe(180), ParseIntPipe) days: number,
  ) {
    const count = await this.activityLogService.clearOld(days);
    return {
      success: true,
      message: `${count} log lama berhasil dihapus`,
    };
  }
}
