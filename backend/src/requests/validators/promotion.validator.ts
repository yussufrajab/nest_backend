import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { differenceInYears } from 'date-fns';

@Injectable()
export class PromotionValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    proposedCadre: string,
    studiedOutsideCountry?: boolean,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // BR-PROM-001: Employee must be confirmed
    if (employee.status !== 'Confirmed') {
      throw new BadRequestException(
        `Employee status is "${employee.status}". Only "Confirmed" employees are eligible for promotion.`,
      );
    }

    // BR-PROM-002: Minimum 2 years in current cadre
    if (!employee.cadre) {
      throw new BadRequestException('Employee current cadre is not set');
    }

    if (employee.cadre === proposedCadre) {
      throw new BadRequestException(
        'Proposed cadre must be different from current cadre',
      );
    }

    // Note: Service years calculation would need promotion history
    // For now, we check if cadre is set (implies some service)
    if (!employee.cadre) {
      throw new BadRequestException(
        'Employee must have a current cadre to be eligible for promotion',
      );
    }

    // BR-PROM-003: TCU verification for foreign qualifications
    if (studiedOutsideCountry) {
      // Check if employee has TCU verification certificate
      const certificates = await this.prisma.employeeCertificate.findMany({
        where: { employeeId },
      });

      const hasTcuVerification = certificates.some(
        (cert) =>
          cert.type.toLowerCase().includes('tcu') ||
          cert.name.toLowerCase().includes('tcu'),
      );

      if (!hasTcuVerification) {
        throw new BadRequestException(
          'TCU verification letter is required for foreign qualifications. Please upload the certificate first.',
        );
      }
    }

    // BR-PROM-005: No existing active promotion request
    const existingRequest = await this.prisma.promotionRequest.findFirst({
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
        `Employee already has a pending promotion request: ${existingRequest.request.id}`,
      );
    }
  }
}
