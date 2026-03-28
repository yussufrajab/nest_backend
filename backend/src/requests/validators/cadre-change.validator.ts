import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CadreChangeValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    newCadre: string,
    reason: string,
    studiedOutsideCountry?: boolean,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Employee must be confirmed
    if (employee.status !== 'Confirmed') {
      throw new BadRequestException(
        `Employee status is "${employee.status}". Only "Confirmed" employees are eligible for cadre change.`,
      );
    }

    // New cadre must be different
    if (employee.cadre === newCadre) {
      throw new BadRequestException(
        'New cadre must be different from current cadre',
      );
    }

    if (!newCadre || newCadre.trim() === '') {
      throw new BadRequestException('New cadre cannot be empty');
    }

    // BR-CADR-003: Reason must be provided
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Reason for cadre change is required');
    }

    // BR-CADR-002: TCU verification for foreign qualifications
    if (studiedOutsideCountry) {
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
          'TCU verification letter is required for foreign qualifications',
        );
      }
    }

    // No existing active cadre change request
    const existingRequest = await this.prisma.cadreChangeRequest.findFirst({
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
        `Employee already has a pending cadre change request: ${existingRequest.request.id}`,
      );
    }
  }
}
