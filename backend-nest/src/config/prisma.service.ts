import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
    console.log('✓ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Proxy all Prisma methods
  get post() {
    return this.prisma.posts;
  }

  get posts() {
    return this.prisma.posts;
  }

  get cabinet() {
    return this.prisma.cabinets;
  }

  get cabinets() {
    return this.prisma.cabinets;
  }

  get division() {
    return this.prisma.divisions;
  }

  get divisions() {
    return this.prisma.divisions;
  }

  get member() {
    return this.prisma.members;
  }

  get members() {
    return this.prisma.members;
  }

  get organization() {
    return this.prisma.organizations;
  }

  get organizations() {
    return this.prisma.organizations;
  }

  get cabinetMember() {
    return this.prisma.members;
  }

  get cabinetMembers() {
    return this.prisma.members;
  }

  get period() {
    return this.prisma.periods;
  }

  get periods() {
    return this.prisma.periods;
  }

  // Generic query method
  async query(command: string) {
    return this.prisma.$queryRawUnsafe(command);
  }
}
