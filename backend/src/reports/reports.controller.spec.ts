import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    generateEmployeeReport: jest.fn(),
    generateRequestReport: jest.fn(),
    generateComplaintReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateEmployeeReport', () => {
    it('should generate employee report PDF', async () => {
      const mockBuffer = Buffer.from('PDF content');
      mockReportsService.generateEmployeeReport.mockResolvedValue(mockBuffer);

      const mockRes = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await controller.generateEmployeeReport(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="employee-report.pdf"'
      );
      expect(mockRes.end).toHaveBeenCalledWith(mockBuffer);
      expect(service.generateEmployeeReport).toHaveBeenCalled();
    });
  });

  describe('generateRequestReport', () => {
    it('should generate request report PDF', async () => {
      const mockBuffer = Buffer.from('PDF content');
      mockReportsService.generateRequestReport.mockResolvedValue(mockBuffer);

      const mockRes = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await controller.generateRequestReport(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="request-report.pdf"'
      );
      expect(mockRes.end).toHaveBeenCalledWith(mockBuffer);
      expect(service.generateRequestReport).toHaveBeenCalled();
    });
  });

  describe('generateComplaintReport', () => {
    it('should generate complaint report PDF', async () => {
      const mockBuffer = Buffer.from('PDF content');
      mockReportsService.generateComplaintReport.mockResolvedValue(mockBuffer);

      const mockRes = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await controller.generateComplaintReport(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="complaint-report.pdf"'
      );
      expect(mockRes.end).toHaveBeenCalledWith(mockBuffer);
      expect(service.generateComplaintReport).toHaveBeenCalled();
    });
  });
});
