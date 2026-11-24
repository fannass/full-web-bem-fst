import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CabinetController } from './cabinet.controller';
import { CabinetService } from './cabinet.service';
import { JwtGuard } from '@/common/guards/jwt.guard';

describe('CabinetController', () => {
  let controller: CabinetController;
  let service: any;

  const mockCabinet = {
    id: 1,
    name: 'Kabinet Loyalist Spectra',
    period_id: 3,
  };

  beforeEach(async () => {
    service = {
      getCurrentCabinet: jest.fn().mockResolvedValue(mockCabinet),
      getAllCabinets: jest.fn().mockResolvedValue([mockCabinet]),
      getCabinetById: jest.fn().mockResolvedValue(mockCabinet),
      createCabinet: jest.fn().mockResolvedValue(mockCabinet),
      updateCabinet: jest.fn().mockResolvedValue(mockCabinet),
      deleteCabinet: jest.fn().mockResolvedValue(undefined),
      getAllMembers: jest.fn().mockResolvedValue([]),
      getMemberById: jest.fn().mockResolvedValue({ id: 1, name: 'Member A' }),
      createMember: jest.fn().mockResolvedValue({ id: 1, name: 'Member A' }),
      updateMember: jest.fn().mockResolvedValue({ id: 1, name: 'Member A' }),
      deleteMember: jest.fn().mockResolvedValue(undefined),
      getAllDivisions: jest.fn().mockResolvedValue([]),
      createDivision: jest.fn().mockResolvedValue({ id: 1, name: 'Divisi A' }),
      updateDivision: jest.fn().mockResolvedValue({ id: 1, name: 'Divisi A' }),
      deleteDivision: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CabinetController],
      providers: [
        {
          provide: CabinetService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CabinetController>(CabinetController);
  });

  it('controller harus terdefinisi', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentCabinet', () => {
    it('harus memanggil service.getCurrentCabinet dan mengembalikan response terformat', async () => {
      const res = await controller.getCurrentCabinet();
      expect(service.getCurrentCabinet).toHaveBeenCalled();
      expect(res).toEqual({ success: true, data: mockCabinet });
    });
  });

  describe('getAllCabinets', () => {
    it('harus memanggil service.getAllCabinets dan mengembalikan array kabinet', async () => {
      const res = await controller.getAllCabinets();
      expect(service.getAllCabinets).toHaveBeenCalled();
      expect(res).toEqual({ success: true, data: [mockCabinet] });
    });
  });

  describe('createCabinet', () => {
    it('harus memanggil service.createCabinet dengan DTO dan mengembalikan status sukses', async () => {
      const dto = { period_id: 3, name: 'Kabinet Baru' };
      const res = await controller.createCabinet(dto);

      expect(service.createCabinet).toHaveBeenCalledWith(dto);
      expect(res).toEqual({
        success: true,
        data: mockCabinet,
        message: 'Kabinet berhasil ditambahkan',
      });
    });
  });

  describe('updateCabinet', () => {
    it('harus memanggil service.updateCabinet dengan ID dan DTO', async () => {
      const dto = { name: 'Kabinet Diperbarui' };
      const res = await controller.updateCabinet(1, dto);

      expect(service.updateCabinet).toHaveBeenCalledWith(1, dto);
      expect(res).toEqual({
        success: true,
        data: mockCabinet,
        message: 'Kabinet berhasil diperbarui',
      });
    });
  });

  describe('deleteCabinet', () => {
    it('harus memanggil service.deleteCabinet dan mengembalikan pesan sukses', async () => {
      const res = await controller.deleteCabinet(1);

      expect(service.deleteCabinet).toHaveBeenCalledWith(1);
      expect(res).toEqual({
        success: true,
        message: 'Kabinet berhasil dihapus',
      });
    });
  });

  describe('getCabinetById', () => {
    it('harus memanggil service.getCabinetById dengan ID', async () => {
      const res = await controller.getCabinetById(1);

      expect(service.getCabinetById).toHaveBeenCalledWith(1);
      expect(res).toEqual({ success: true, data: mockCabinet });
    });
  });

  describe('Security: JwtGuard pada semua endpoint mutasi', () => {
    const protectedMethods: (keyof CabinetController)[] = [
      'createMember',
      'updateMember',
      'deleteMember',
      'createDivision',
      'updateDivision',
      'deleteDivision',
      'createCabinet',
      'updateCabinet',
      'deleteCabinet',
    ];

    it.each(protectedMethods)(
      'endpoint %s harus dilindungi oleh JwtGuard',
      (methodName) => {
        const guards = Reflect.getMetadata(
          GUARDS_METADATA,
          CabinetController.prototype[methodName],
        );
        expect(guards).toBeDefined();
        expect(guards).toContain(JwtGuard);
      },
    );
  });
});
