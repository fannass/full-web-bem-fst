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
  NotFoundException,
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
import { AuthService } from '@/modules/auth/auth.service';

@Controller('api/v1/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly activityLogService: ActivityLogService,
    private readonly authService: AuthService,
  ) {}

  private async isAdminRequest(req?: Request): Promise<boolean> {
    const authHeader = req?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.slice(7).trim();
    if (!token) return false;
    try {
      const payload = await this.authService.validateToken(token);
      return payload?.role === 'admin';
    } catch {
      return false;
    }
  }

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

  // Get all posts — unauthenticated callers only receive published posts
  @Get()
  async findAll(
    @Req() req?: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    let pageNum = 1;
    if (page !== undefined && page !== '') {
      if (!/^\d+$/.test(page)) {
        throw new BadRequestException('Parameter page harus berupa bilangan bulat positif');
      }
      pageNum = Number(page);
    }

    let limitNum = 6;
    if (limit !== undefined && limit !== '') {
      if (!/^\d+$/.test(limit)) {
        throw new BadRequestException('Parameter limit harus berupa bilangan bulat positif');
      }
      limitNum = Number(limit);
    }

    if (pageNum < 1) {
      throw new BadRequestException('Page harus lebih dari 0');
    }

    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit harus antara 1 sampai 100');
    }

    const allowedStatuses = ['published', 'draft'];
    if (status !== undefined && status !== '' && !allowedStatuses.includes(status)) {
      throw new BadRequestException('Status tidak valid. Gunakan: published atau draft');
    }

    const isAdmin = await this.isAdminRequest(req);
    const effectiveStatus = isAdmin ? (status || undefined) : 'published';

    const result = await this.postsService.findAll(pageNum, limitNum, effectiveStatus);
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

  // Get post by slug — draft posts require admin auth
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Req() req?: Request) {
    const post = await this.postsService.findBySlug(slug);
    if (post.status !== 'published') {
      const isAdmin = await this.isAdminRequest(req);
      if (!isAdmin) {
        throw new NotFoundException(`Post dengan slug ${slug} tidak ditemukan`);
      }
    }
    return {
      success: true,
      data: post,
    };
  }

  // Get post by ID — draft posts require admin auth
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req?: Request) {
    const post = await this.postsService.findOne(id);
    if (post.status !== 'published') {
      const isAdmin = await this.isAdminRequest(req);
      if (!isAdmin) {
        throw new NotFoundException(`Post dengan ID ${id} tidak ditemukan`);
      }
    }
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
