import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateCabinetMemberDto, UpdateCabinetMemberDto } from './dto/create-member.dto';
import { CreateDivisionDto } from './dto/create-division.dto';

@Injectable()
export class CabinetService {
  constructor(private prisma: PrismaService) {}

  async getCurrentCabinet() {
    // Get the latest cabinet with divisions and members
    const cabinet = await this.prisma.cabinets.findFirst({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!cabinet) {
      throw new NotFoundException('Kabinet tidak ditemukan');
    }

    return cabinet;
  }

  async getCabinetById(id: number) {
    const cabinet = await this.prisma.cabinets.findUnique({
      where: { id },
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!cabinet) {
      throw new NotFoundException(`Kabinet dengan ID ${id} tidak ditemukan`);
    }

    return cabinet;
  }

  async getAllCabinets() {
    return this.prisma.cabinets.findMany({
      include: {
        divisions: {
          include: {
            members: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getAllMembers() {
    return this.prisma.members.findMany({
      include: {
        divisions: {
          include: {
            cabinets: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async getMemberById(id: number) {
    const member = await this.prisma.members.findUnique({
      where: { id },
      include: {
        divisions: {
          include: {
            cabinets: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member dengan ID ${id} tidak ditemukan`);
    }

    return member;
  }

  // ===== MEMBER CRUD =====

  async createMember(dto: CreateCabinetMemberDto) {
    return this.prisma.members.create({
      data: {
        division_id: BigInt(dto.division_id),
        name: dto.name,
        position: dto.position,
        prodi: dto.prodi || '',
        photo: dto.photo,
        bio: dto.bio,
        instagram: dto.instagram,
        linkedin: dto.linkedin,
        order: dto.order ?? 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: { divisions: true },
    });
  }

  async updateMember(id: number, dto: UpdateCabinetMemberDto) {
    await this.getMemberById(id);
    return this.prisma.members.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.division_id !== undefined && { division_id: BigInt(dto.division_id) }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.prodi !== undefined && { prodi: dto.prodi }),
        ...(dto.photo !== undefined && { photo: dto.photo }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.instagram !== undefined && { instagram: dto.instagram }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
        ...(dto.order !== undefined && { order: dto.order }),
        updated_at: new Date(),
      },
      include: { divisions: true },
    });
  }

  async deleteMember(id: number) {
    await this.getMemberById(id);
    return this.prisma.members.delete({ where: { id: BigInt(id) } });
  }

  // ===== DIVISION CRUD =====

  async getAllDivisions() {
    return this.prisma.divisions.findMany({
      include: {
        cabinets: true,
        members: true,
      },
      orderBy: [{ cabinet_id: 'asc' }, { order: 'asc' }],
    });
  }

  async createDivision(dto: CreateDivisionDto) {
    return this.prisma.divisions.create({
      data: {
        cabinet_id: BigInt(dto.cabinet_id),
        name: dto.name,
        description: dto.description,
        order: dto.order ?? 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: { cabinets: true },
    });
  }

  async updateDivision(id: number, dto: Partial<CreateDivisionDto>) {
    const exists = await this.prisma.divisions.findUnique({ where: { id: BigInt(id) } });
    if (!exists) throw new NotFoundException(`Divisi dengan ID ${id} tidak ditemukan`);
    return this.prisma.divisions.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.order !== undefined && { order: dto.order }),
        updated_at: new Date(),
      },
      include: { cabinets: true },
    });
  }

  async deleteDivision(id: number) {
    const exists = await this.prisma.divisions.findUnique({ where: { id: BigInt(id) } });
    if (!exists) throw new NotFoundException(`Divisi dengan ID ${id} tidak ditemukan`);
    return this.prisma.divisions.delete({ where: { id: BigInt(id) } });
  }

  // ===== CABINET CRUD =====

  async createCabinet(dto: { period_id: number; name: string; tagline?: string; vision?: string; mission?: string; description?: string }) {
    return this.prisma.cabinets.create({
      data: {
        period_id: BigInt(dto.period_id),
        name: dto.name,
        tagline: dto.tagline,
        vision: dto.vision,
        mission: dto.mission,
        description: dto.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async updateCabinet(id: number, dto: { period_id?: number; name?: string; tagline?: string; vision?: string; mission?: string; description?: string }) {
    const exists = await this.prisma.cabinets.findUnique({ where: { id: BigInt(id) } });
    if (!exists) throw new NotFoundException(`Kabinet dengan ID ${id} tidak ditemukan`);
    return this.prisma.cabinets.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.period_id !== undefined && { period_id: BigInt(dto.period_id) }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
        ...(dto.vision !== undefined && { vision: dto.vision }),
        ...(dto.mission !== undefined && { mission: dto.mission }),
        ...(dto.description !== undefined && { description: dto.description }),
        updated_at: new Date(),
      },
    });
  }

  async deleteCabinet(id: number) {
    const exists = await this.prisma.cabinets.findUnique({ where: { id: BigInt(id) } });
    if (!exists) throw new NotFoundException(`Kabinet dengan ID ${id} tidak ditemukan`);
    return this.prisma.cabinets.delete({ where: { id: BigInt(id) } });
  }
}
