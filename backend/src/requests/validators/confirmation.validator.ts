import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { differenceInMonths, differenceInDays } from 'date-fns';

@Injectable()
export class ConfirmationValidator {
  constructor(private prisma: PrismaService) {}

  async validate(employeeId: string): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // BR-CONF-001: Employee must be on probation
    if (employee.status !== 'On Probation') {
      throw new BadRequestException(
        `Employee status is "${employee.status}". Only employees with "On Probation" status can be confirmed.`,
      );
    }

    // BR-CONF-001: Minimum 12 months probation
    if (!employee.employmentDate) {
      throw new BadRequestException('Employee employment date is not set');
    }

    const probationMonths = differenceInMonths(
      new Date(),
      new Date(employee.employmentDate),
    );

    if (probationMonths < 12) {
      throw new BadRequestException(
        `Employee has only completed ${probationMonths} months of probation. Minimum 12 months required.`,
      );
    }

    // BR-CONF-002: No existing active confirmation request
    const existingRequest = await this.prisma.confirmationRequest.findFirst({
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
        `Employee already has a pending confirmation request: ${existingRequest.request.id}`,
      );
    }
  }
}
