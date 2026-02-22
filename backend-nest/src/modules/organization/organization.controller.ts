import { Controller, Get, Put, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';

@Controller('api/v1/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // Get main organization
  @Get()
  async getOrganization() {
    const org = await this.organizationService.getOrganization();
    return {
      success: true,
      data: org,
    };
  }

  // Get organization by ID
  @Get(':id')
  async getOrganizationById(@Param('id', ParseIntPipe) id: number) {
    const org = await this.organizationService.getOrganizationById(id);
    return { success: true, data: org };
  }

  // Update organization (admin only)
  @Put(':id')
  @UseGuards(JwtGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrganizationDto) {
    const org = await this.organizationService.update(id, dto);
    return { success: true, data: org, message: 'Organisasi berhasil diperbarui' };
  }
}
