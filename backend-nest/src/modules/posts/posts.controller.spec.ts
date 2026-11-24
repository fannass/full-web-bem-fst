declare global {
  namespace Express {
    namespace Multer {
      interface File {
        buffer: Buffer;
        mimetype: string;
        size: number;
        originalname: string;
      }
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ActivityLogService } from '@/modules/activity-log/activity-log.service';
import { AuthService } from '@/modules/auth/auth.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: { findAll: jest.Mock; findOne: jest.Mock; findBySlug: jest.Mock };
  let authService: { validateToken: jest.Mock };

  beforeEach(async () => {
    postsService = {
      findAll: jest.fn().mockResolvedValue({
        data: [],
        meta: { current_page: 1, per_page: 6, total: 0, last_page: 0 },
      }),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
    };

    authService = {
      validateToken: jest.fn().mockImplementation(async (token: string) => {
        if (token === 'valid-admin-token') {
          return { username: 'admin', role: 'admin' };
        }
        throw new UnauthorizedException('Token tidak valid');
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: postsService },
        { provide: ActivityLogService, useValue: { log: jest.fn() } },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  describe('findAll query validation & draft protection', () => {
    it('memaksa status published untuk request publik tanpa token', async () => {
      const res = await controller.findAll(undefined);
      expect(postsService.findAll).toHaveBeenCalledWith(1, 6, 'published');
      expect(res.success).toBe(true);
    });

    it('memaksa status published meski request publik meminta ?status=draft', async () => {
      await controller.findAll({ headers: {} } as any, '1', '6', 'draft');
      expect(postsService.findAll).toHaveBeenCalledWith(1, 6, 'published');
    });

    it('mengizinkan admin terautentikasi melihat semua post atau filter draft', async () => {
      const adminReq = { headers: { authorization: 'Bearer valid-admin-token' } } as any;
      await controller.findAll(adminReq, '2', '12', undefined);
      expect(postsService.findAll).toHaveBeenCalledWith(2, 12, undefined);

      await controller.findAll(adminReq, '1', '10', 'draft');
      expect(postsService.findAll).toHaveBeenCalledWith(1, 10, 'draft');
    });

    it('menolak payload SQLi atau karakter non-numerik pada limit dengan BadRequestException (400)', async () => {
      await expect(controller.findAll(undefined, '1', "1' OR '1'='1")).rejects.toThrow(BadRequestException);
      await expect(controller.findAll(undefined, '1', '1 AND SLEEP(3)')).rejects.toThrow(BadRequestException);
      await expect(controller.findAll(undefined, '1', 'abc')).rejects.toThrow(BadRequestException);
    });

    it('menolak payload SQLi atau karakter non-numerik pada page dengan BadRequestException (400)', async () => {
      await expect(controller.findAll(undefined, "1' OR '1'='1", '6')).rejects.toThrow(BadRequestException);
      await expect(controller.findAll(undefined, '0', '6')).rejects.toThrow(BadRequestException);
    });

    it('menolak limit di luar rentang 1..100 dengan BadRequestException (400)', async () => {
      await expect(controller.findAll(undefined, '1', '0')).rejects.toThrow(BadRequestException);
      await expect(controller.findAll(undefined, '1', '101')).rejects.toThrow(BadRequestException);
      await expect(controller.findAll(undefined, '1', '999999')).rejects.toThrow(BadRequestException);
    });

    it('menolak status yang tidak valid dengan BadRequestException (400)', async () => {
      await expect(controller.findAll(undefined, '1', '6', 'invalid_status')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne & findBySlug draft protection', () => {
    it('menolak akses post draft oleh pengunjung publik dengan 404', async () => {
      postsService.findOne.mockResolvedValue({ id: 1, title: 'Secret Draft', status: 'draft' });
      postsService.findBySlug.mockResolvedValue({ id: 1, slug: 'secret-draft', status: 'draft' });

      await expect(controller.findOne(1, { headers: {} } as any)).rejects.toThrow(NotFoundException);
      await expect(controller.findBySlug('secret-draft', { headers: {} } as any)).rejects.toThrow(NotFoundException);
    });

    it('mengizinkan admin melihat post draft via ID atau slug', async () => {
      const adminReq = { headers: { authorization: 'Bearer valid-admin-token' } } as any;
      const draftPost = { id: 1, slug: 'secret-draft', status: 'draft' };
      postsService.findOne.mockResolvedValue(draftPost);
      postsService.findBySlug.mockResolvedValue(draftPost);

      const resById = await controller.findOne(1, adminReq);
      const resBySlug = await controller.findBySlug('secret-draft', adminReq);
      expect(resById.data).toEqual(draftPost);
      expect(resBySlug.data).toEqual(draftPost);
    });
  });
});
