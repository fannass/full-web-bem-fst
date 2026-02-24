import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';

export interface LogData {
  action: string;
  entityType?: string;
  entityId?: number;
  entityTitle?: string;
  actor?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: LogData): Promise<void> {
    try {
      await this.prisma.activity_logs.create({
        data: {
          action: data.action,
          entity_type: data.entityType ?? null,
          entity_id: data.entityId ? BigInt(data.entityId) : null,
          entity_title: data.entityTitle ?? null,
          actor: data.actor || 'admin',
          ip_address: data.ipAddress ?? null,
          metadata: data.metadata ?? undefined,
        },
      });
    } catch (err) {
      // Never let logging break the main request
      console.error('[ActivityLog] Failed to write log:', err);
    }
  }

  async findAll(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.activity_logs.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity_logs.count(),
    ]);

    return {
      data: logs.map((l) => ({
        id: l.id.toString(),
        action: l.action,
        entity_type: l.entity_type,
        entity_id: l.entity_id?.toString() ?? null,
        entity_title: l.entity_title,
        actor: l.actor,
        ip_address: l.ip_address,
        metadata: l.metadata,
        created_at: l.created_at instanceof Date ? l.created_at.toISOString() : l.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async clearOld(daysOld = 180): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const { count } = await this.prisma.activity_logs.deleteMany({
      where: { created_at: { lt: cutoff } },
    });
    return count;
  }
}
