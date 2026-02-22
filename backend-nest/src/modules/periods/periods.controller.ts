import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';

@Controller('api/v1/periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  async findAll() {
    const data = await this.periodsService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.periodsService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() dto: CreatePeriodDto) {
    const data = await this.periodsService.create(dto);
    return { success: true, data, message: 'Periode berhasil ditambahkan' };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreatePeriodDto>) {
    const data = await this.periodsService.update(id, dto);
    return { success: true, data, message: 'Periode berhasil diperbarui' };
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.periodsService.remove(id);
    return { success: true, message: result.message };
  }
}
