import {
  Controller, Get, Post, Put, Delete,
  Param, Body, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CabinetService } from './cabinet.service';
import { CreateCabinetMemberDto, UpdateCabinetMemberDto } from './dto/create-member.dto';
import { CreateDivisionDto } from './dto/create-division.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';

@Controller('api/v1/cabinet')
export class CabinetController {
  constructor(private readonly cabinetService: CabinetService) {}

  // Get current cabinet with all members
  @Get('current')
  async getCurrentCabinet() {
    const cabinet = await this.cabinetService.getCurrentCabinet();
    return {
      success: true,
      data: cabinet,
    };
  }

  // Get all cabinets
  @Get()
  async getAllCabinets() {
    const cabinets = await this.cabinetService.getAllCabinets();
    return {
      success: true,
      data: cabinets,
    };
  }

  // ===== MEMBERS =====

  // Get all members
  @Get('members/list')
  async getAllMembers() {
    const members = await this.cabinetService.getAllMembers();
    return {
      success: true,
      data: members,
    };
  }

  // Get member by ID
  @Get('members/:id')
  async getMemberById(@Param('id', ParseIntPipe) id: number) {
    const member = await this.cabinetService.getMemberById(id);
    return { success: true, data: member };
  }

  // Create member
  @Post('members')
  async createMember(@Body() dto: CreateCabinetMemberDto) {
    const member = await this.cabinetService.createMember(dto);
    return { success: true, data: member, message: 'Anggota berhasil ditambahkan' };
  }

  // Update member
  @Put('members/:id')
  async updateMember(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCabinetMemberDto) {
    const member = await this.cabinetService.updateMember(id, dto);
    return { success: true, data: member, message: 'Anggota berhasil diperbarui' };
  }

  // Delete member
  @Delete('members/:id')
  async deleteMember(@Param('id', ParseIntPipe) id: number) {
    await this.cabinetService.deleteMember(id);
    return { success: true, message: 'Anggota berhasil dihapus' };
  }

  // ===== DIVISIONS =====

  // Get all divisions
  @Get('divisions')
  async getAllDivisions() {
    const divisions = await this.cabinetService.getAllDivisions();
    return { success: true, data: divisions };
  }

  // Create division
  @Post('divisions')
  async createDivision(@Body() dto: CreateDivisionDto) {
    const division = await this.cabinetService.createDivision(dto);
    return { success: true, data: division, message: 'Departemen berhasil ditambahkan' };
  }

  // Update division
  @Put('divisions/:id')
  async updateDivision(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateDivisionDto>) {
    const division = await this.cabinetService.updateDivision(id, dto);
    return { success: true, data: division, message: 'Departemen berhasil diperbarui' };
  }

  // Delete division
  @Delete('divisions/:id')
  async deleteDivision(@Param('id', ParseIntPipe) id: number) {
    await this.cabinetService.deleteDivision(id);
    return { success: true, message: 'Departemen berhasil dihapus' };
  }

  // ===== CABINET CRUD =====

  // Create cabinet
  @Post()
  @UseGuards(JwtGuard)
  async createCabinet(@Body() body: { period_id: number; name: string; tagline?: string; vision?: string; mission?: string; description?: string }) {
    const data = await this.cabinetService.createCabinet(body);
    return { success: true, data, message: 'Kabinet berhasil ditambahkan' };
  }

  // Update cabinet
  @Put(':id')
  @UseGuards(JwtGuard)
  async updateCabinet(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.cabinetService.updateCabinet(id, body);
    return { success: true, data, message: 'Kabinet berhasil diperbarui' };
  }

  // Delete cabinet
  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteCabinet(@Param('id', ParseIntPipe) id: number) {
    await this.cabinetService.deleteCabinet(id);
    return { success: true, message: 'Kabinet berhasil dihapus' };
  }

  // ===== CABINET BY ID (catch-all, must be last) =====

  @Get(':id')
  async getCabinetById(@Param('id', ParseIntPipe) id: number) {
    const cabinet = await this.cabinetService.getCabinetById(id);
    return { success: true, data: cabinet };
  }
}
