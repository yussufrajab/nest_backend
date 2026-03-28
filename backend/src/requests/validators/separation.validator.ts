import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeparationValidator {
  constructor(private prisma: PrismaService) {}

  async validate(
    employeeId: string,
    type: 'Termination' | 'Dismissal',
    reason: string,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // BR-TERM-002: Type must match employee status
    // Termination is for probationary employees, Dismissal is for confirmed employees
    if (type === 'Termination' && employee.status !== 'On Probation') {
      throw new BadRequestException(
        `Termination is for probationary employees only. Employee status is "${employee.status}". Use "Dismissal" for confirmed employees.`,
      );
    }

    if (type === 'Dismissal' && employee.status !== 'Confirmed') {
      throw new BadRequestException(
        `Dismissal is for confirmed employees only. Employee status is "${employee.status}". Use "Termination" for probationary employees.`,
      );
    }

    // BR-TERM-003: Reason must be documented
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Reason for separation is required');
    }

    if (reason.length < 20) {
      throw new BadRequestException(
        'Reason must be at least 20 characters long to ensure adequate documentation',
      );
    }

    // No existing active separation request
    const existingRequest = await this.prisma.separationRequest.findFirst({
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
        `Employee already has a pending separation request: ${existingRequest.request.id}`,
      );
    }
  }
}
