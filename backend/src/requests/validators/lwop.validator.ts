import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { differenceInMonths, parse } from 'date-fns';

@Injectable()
export class LwopValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    duration: string,
    reason: string,
    startDate?: string,
    endDate?: string,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // BR-LWOP-001: Duration validation (1 month - 3 years)
    const durationMatch = duration.match(/(\d+)\s*(month|months|year|years)/i);
    if (!durationMatch) {
      throw new BadRequestException(
        'Invalid duration format. Use format like "6 months", "1 year", "2 years"',
      );
    }

    const durationValue = parseInt(durationMatch[1], 10);
    const durationUnit = durationMatch[2].toLowerCase();
    const durationInMonths =
      durationUnit.startsWith('year') ? durationValue * 12 : durationValue;

    if (durationInMonths < 1) {
      throw new BadRequestException(
        'LWOP duration must be at least 1 month',
      );
    }

    if (durationInMonths > 36) {
      throw new BadRequestException(
        'LWOP duration cannot exceed 3 years (36 months)',
      );
    }

    // BR-LWOP-002: Maximum 2 lifetime LWOPs
    const previousLwops = await this.prisma.lwopRequest.findMany({
      where: { request: { employeeId } },
    });

    if (previousLwops.length >= 2) {
      throw new BadRequestException(
        'Employee has already used the maximum allowance of 2 LWOP periods in their career',
      );
    }

    // BR-LWOP-003: Prohibited reasons check (manual verification warning)
    const prohibitedReasons = [
      'political campaign',
      'campaign',
      'competitor',
      'competing organization',
    ];

    const reasonLower = reason.toLowerCase();
    const hasProhibitedReason = prohibitedReasons.some((prohibited) =>
      reasonLower.includes(prohibited),
    );

    if (hasProhibitedReason) {
      throw new BadRequestException(
        'The stated reason may not be acceptable for LWOP. LWOP cannot be granted for political campaigning or work with competitor organizations.',
      );
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new BadRequestException(
          'Start date must be before end date',
        );
      }

      const actualDurationMonths = differenceInMonths(end, start);
      if (actualDurationMonths < 1 || actualDurationMonths > 36) {
        throw new BadRequestException(
          'Date range must be between 1 month and 3 years',
        );
      }
    }

    // BR-LWOP-005: No existing active LWOP request
    const existingRequest = await this.prisma.lwopRequest.findFirst({
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
        `Employee already has a pending LWOP request: ${existingRequest.request.id}`,
      );
    }
  }
}
