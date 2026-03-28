import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { differenceInMonths } from 'date-fns';

@Injectable()
export class ServiceExtensionValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    requestedExtensionPeriod: string,
    justification: string,
    currentRetirementDate?: string,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // BR-SEXT-001: Employee must have retirement date set
    const retirementDate = currentRetirementDate || employee.retirementDate;
    if (!retirementDate) {
      throw new BadRequestException(
        'Employee must have a retirement date set to request service extension',
      );
    }

    // BR-SEXT-002: Request must be before retirement date
    const retirementDateObj = new Date(retirementDate);
    if (retirementDateObj < new Date()) {
      throw new BadRequestException(
        'Retirement date is in the past. Service extension must be requested before retirement',
      );
    }

    // Check if retirement is approaching (within 6 months)
    const monthsUntilRetirement = differenceInMonths(
      retirementDateObj,
      new Date(),
    );

    if (monthsUntilRetirement > 6 && monthsUntilRetirement < 0) {
      // Allow some flexibility, but warn if too early or too late
      // This is a soft validation
    }

    // BR-SEXT-003: Extension period validation (6 months - 3 years)
    const periodMatch = requestedExtensionPeriod.match(
      /(\d+)\s*(month|months|year|years)/i,
    );
    if (!periodMatch) {
      throw new BadRequestException(
        'Invalid extension period format. Use format like "6 months", "1 year", "2 years"',
      );
    }

    const periodValue = parseInt(periodMatch[1], 10);
    const periodUnit = periodMatch[2].toLowerCase();
    const periodInMonths =
      periodUnit.startsWith('year') ? periodValue * 12 : periodValue;

    if (periodInMonths < 6) {
      throw new BadRequestException(
        'Service extension period must be at least 6 months',
      );
    }

    if (periodInMonths > 36) {
      throw new BadRequestException(
        'Service extension period cannot exceed 3 years (36 months)',
      );
    }

    // BR-SEXT-004: Maximum 2 lifetime extensions
    const previousExtensions = await this.prisma.serviceExtensionRequest.findMany({
      where: { request: { employeeId } },
    });

    if (previousExtensions.length >= 2) {
      throw new BadRequestException(
        'Employee has already used the maximum allowance of 2 service extensions in their career',
      );
    }

    // BR-SEXT-005: Justification required
    if (!justification || justification.trim() === '') {
      throw new BadRequestException(
        'Justification for service extension is required',
      );
    }

    // No existing active extension request
    const existingRequest = await this.prisma.serviceExtensionRequest.findFirst({
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
        `Employee already has a pending service extension request: ${existingRequest.request.id}`,
      );
    }
  }
}
