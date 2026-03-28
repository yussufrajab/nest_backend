import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { differenceInDays } from 'date-fns';

@Injectable()
export class ResignationValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    effectiveDate: string,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // BR-RESN-004: Employee must be confirmed (not probationary)
    if (employee.status !== 'Confirmed') {
      throw new BadRequestException(
        `Employee status is "${employee.status}". Only "Confirmed" employees can resign. Probationary employees use the Dismissal process.`,
      );
    }

    // BR-RESN-001: Effective date must be >= 3 months from submission
    const effectiveDateObj = new Date(effectiveDate);
    const today = new Date();
    const daysUntilEffective = differenceInDays(effectiveDateObj, today);

    if (daysUntilEffective < 90) {
      throw new BadRequestException(
        `Resignation requires 3-month (90 days) notice. Effective date must be at least 90 days from today. Currently ${daysUntilEffective} days provided.`,
      );
    }

    // Effective date cannot be in the past
    if (effectiveDateObj < today) {
      throw new BadRequestException(
        'Effective date cannot be in the past',
      );
    }

    // No existing active resignation request
    const existingRequest = await this.prisma.resignationRequest.findFirst({
      where: {
        request: {
          status: { in: ['PENDING', 'RETURNED'] },
          employeeId,
        },
      },
      include: { request: { select: { id: true } } },
    });

    if (existingRequest) {
      throw new BadRequestException(
        `Employee already has a pending resignation request: ${existingRequest.request.id}`,
      );
    }
  }
}
