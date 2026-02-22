import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreatePeriodDto } from './dto/create-period.dto';

@Injectable()
export class PeriodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.periods.findMany({ orderBy: { year_start: 'desc' } });
  }

  async findOne(id: number) {
    const p = await this.prisma.periods.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Periode tidak ditemukan`);
    return p;
  }

  async create(dto: CreatePeriodDto) {
    if (dto.is_active) {
      // deactivate all others first
      await this.prisma.periods.updateMany({ data: { is_active: false } });
    }
    return this.prisma.periods.create({
      data: {
        name: dto.name,
        year_start: dto.year_start,
        year_end: dto.year_end,
        is_active: dto.is_active ?? false,
        description: dto.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async update(id: number, dto: Partial<CreatePeriodDto>) {
    await this.findOne(id);
    if (dto.is_active) {
      await this.prisma.periods.updateMany({ data: { is_active: false } });
    }
    return this.prisma.periods.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.year_start !== undefined && { year_start: dto.year_start }),
        ...(dto.year_end !== undefined && { year_end: dto.year_end }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        ...(dto.description !== undefined && { description: dto.description }),
        updated_at: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.periods.delete({ where: { id } });
    return { message: 'Periode berhasil dihapus' };
  }
}
