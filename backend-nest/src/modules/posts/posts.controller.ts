import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Response,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { ActivityLogService } from '@/modules/activity-log/activity-log.service';

@Controller('api/v1/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  // Create post (admin only)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('featured_image'))
  async create(
    @Req() req: Request,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (!createPostDto.title || !createPostDto.content) {
        throw new BadRequestException('Judul dan konten tidak boleh kosong');
      }

      const post = await this.postsService.create(createPostDto, file);
      await this.activityLogService.log({
        action: 'post.created',
        entityType: 'post',
        entityId: Number(post.id),
        entityTitle: post.title,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
        metadata: { category: post.category, status: post.status },
      });
      return {
        success: true,
        message: 'Post berhasil dibuat',
        data: post,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all posts (public) — add ?status=published to filter by status
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 6;
    
    if (pageNum < 1) {
      throw new BadRequestException('Page harus lebih dari 0');
    }
    
    const result = await this.postsService.findAll(pageNum, limitNum, status);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  // Generate dynamic sitemap (public)
  @Get('sitemap/xml')
  async generateSitemap(@Response() res: any) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const sitemap = await this.postsService.generateSitemap(baseUrl);
      
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      throw error;
    }
  }

  // Get post by slug (public)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const post = await this.postsService.findBySlug(slug);
    return {
      success: true,
      data: post,
    };
  }

  // Get post by ID (public)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.findOne(id);
    return {
      success: true,
      data: post,
    };
  }

  // Update post (admin only)
  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('featured_image'))
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const post = await this.postsService.update(id, updatePostDto, file);
      const action = updatePostDto.status === 'published' ? 'post.published' : 'post.updated';
      await this.activityLogService.log({
        action,
        entityType: 'post',
        entityId: id,
        entityTitle: post.title,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
        metadata: { category: post.category, status: post.status },
      });
      return {
        success: true,
        message: 'Post berhasil diperbarui',
        data: post,
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete post (admin only)
  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.findOne(id).catch(() => null);
    const result = await this.postsService.remove(id);
    await this.activityLogService.log({
      action: 'post.deleted',
      entityType: 'post',
      entityId: id,
      entityTitle: post?.title ?? `Post #${id}`,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      metadata: { id },
    });
    return {
      success: true,
      message: result.message,
    };
  }
}
