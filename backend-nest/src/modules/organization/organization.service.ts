import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getOrganization() {
    // Get the first (main) organization
    const org = await this.prisma.organizations.findFirst();

    if (!org) {
      throw new NotFoundException('Organisasi tidak ditemukan');
    }

    return org;
  }

  async getOrganizationById(id: number) {
    const org = await this.prisma.organizations.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundException(`Organisasi dengan ID ${id} tidak ditemukan`);
    }

    return org;
  }

  async update(id: number, dto: UpdateOrganizationDto) {
    const org = await this.prisma.organizations.findUnique({ where: { id } });
    if (!org) throw new NotFoundException(`Organisasi tidak ditemukan`);

    return this.prisma.organizations.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.social_media !== undefined && { social_media: dto.social_media }),
        updated_at: new Date(),
      },
    });
  }
}
