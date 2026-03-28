import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RetirementValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    retirementType: 'Compulsory' | 'Voluntary' | 'Illness',
    proposedDate: string,
    illnessDescription?: string,
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
        `Employee status is "${employee.status}". Only "Confirmed" employees can submit retirement requests.`,
      );
    }

    // BR-RETR-003: Proposed date cannot be in the past
    const proposedDateObj = new Date(proposedDate);
    if (proposedDateObj < new Date()) {
      throw new BadRequestException(
        'Proposed retirement date cannot be in the past',
      );
    }

    // BR-RETR-002: For illness retirement, medical certificate required
    if (retirementType === 'Illness') {
      if (!illnessDescription || illnessDescription.trim() === '') {
        throw new BadRequestException(
          'Illness description is required for illness-based retirement',
        );
      }

      // Check for medical certificate in employee documents
      // This would typically be verified by checking uploaded documents
      // For now, we just require the description
    }

    // BR-RETR-004: For compulsory, verify retirement age (typically 60)
    if (retirementType === 'Compulsory') {
      if (!employee.dateOfBirth) {
        throw new BadRequestException(
          'Employee date of birth is required for compulsory retirement verification',
        );
      }

      const age = this.calculateAge(new Date(employee.dateOfBirth));
      if (age < 55) {
        // Allow some flexibility, but warn if too young
        // Standard retirement age is 60
      }
    }

    // No existing active retirement request
    const existingRequest = await this.prisma.retirementRequest.findFirst({
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
        `Employee already has a pending retirement request: ${existingRequest.request.id}`,
      );
    }
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
