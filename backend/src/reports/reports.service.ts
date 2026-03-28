import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateEmployeeReport(): Promise<Buffer> {
    const employees = await this.prisma.employee.findMany({
      include: { institution: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.createPDF('Employee Report', (doc) => {
      // Summary
      doc.fontSize(12).text(`Total Employees: ${employees.length}`, { align: 'left' });
      doc.moveDown();

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Name', 50, doc.y);
      doc.text('ZanID', 200, doc.y);
      doc.text('Institution', 280, doc.y);
      doc.text('Cadre', 400, doc.y);
      doc.text('Status', 500, doc.y);
      doc.moveDown(20);

      // Table rows
      doc.font('Helvetica');
      employees.forEach((employee) => {
        doc.text(employee.name, 50, doc.y, { width: 140, ellipsis: true });
        doc.text(employee.zanId, 200, doc.y);
        doc.text(employee.institution?.name || 'N/A', 280, doc.y, { width: 110, ellipsis: true });
        doc.text(employee.cadre || 'N/A', 400, doc.y, { width: 90, ellipsis: true });
        doc.text(employee.status || 'Unknown', 500, doc.y);
        doc.moveDown(20);
      });
    });
  }

  async generateRequestReport(): Promise<Buffer> {
    const requests = await this.prisma.request.findMany({
      include: {
        employee: { select: { name: true, zanId: true } },
        submittedBy: { select: { name: true, role: true } },
        confirmation: true,
        promotion: true,
        lwop: true,
        cadreChange: true,
        retirement: true,
        resignation: true,
        serviceExtension: true,
        separation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.createPDF('Request Report', (doc) => {
      // Summary
      const pending = requests.filter((r) => r.status === 'PENDING').length;
      const approved = requests.filter((r) => r.status === 'APPROVED').length;
      const rejected = requests.filter((r) => r.status === 'REJECTED').length;

      doc.fontSize(12).text(`Total Requests: ${requests.length}`, { align: 'left' });
      doc.text(`Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected}`, { align: 'left' });
      doc.moveDown();

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Type', 50, doc.y);
      doc.text('Employee', 130, doc.y);
      doc.text('Submitted By', 280, doc.y);
      doc.text('Status', 420, doc.y);
      doc.text('Date', 490, doc.y);
      doc.moveDown(20);

      // Table rows
      doc.font('Helvetica');
      requests.forEach((request) => {
        const type = this.getRequestType(request);
        doc.text(type, 50, doc.y, { width: 70, ellipsis: true });
        doc.text(request.employee.name, 130, doc.y, { width: 140, ellipsis: true });
        doc.text(request.submittedBy.name, 280, doc.y, { width: 130, ellipsis: true });
        doc.text(request.status, 420, doc.y);
        doc.text(new Date(request.createdAt).toLocaleDateString(), 490, doc.y);
        doc.moveDown(20);
      });
    });
  }

  async generateComplaintReport(): Promise<Buffer> {
    const complaints = await this.prisma.complaint.findMany({
      include: {
        complainant: { select: { name: true, username: true } },
        reviewedBy: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.createPDF('Complaint Report', (doc) => {
      // Summary
      const resolved = complaints.filter((c) => c.status === 'Resolved').length;
      const pending = complaints.filter((c) => c.status === 'Pending').length;

      doc.fontSize(12).text(`Total Complaints: ${complaints.length}`, { align: 'left' });
      doc.text(`Resolved: ${resolved} | Pending: ${pending}`, { align: 'left' });
      doc.moveDown();

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Type', 50, doc.y);
      doc.text('Subject', 130, doc.y);
      doc.text('Complainant', 280, doc.y);
      doc.text('Status', 420, doc.y);
      doc.text('Date', 490, doc.y);
      doc.moveDown(20);

      // Table rows
      doc.font('Helvetica');
      complaints.forEach((complaint) => {
        doc.text(complaint.complaintType, 50, doc.y, { width: 70, ellipsis: true });
        doc.text(complaint.subject, 130, doc.y, { width: 140, ellipsis: true });
        doc.text(complaint.complainant.name, 280, doc.y, { width: 130, ellipsis: true });
        doc.text(complaint.status, 420, doc.y);
        doc.text(new Date(complaint.createdAt).toLocaleDateString(), 490, doc.y);
        doc.moveDown(20);
      });
    });
  }

  private createPDF(
    title: string,
    contentFn: (doc: PDFKit.PDFDocument) => void,
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown(2);

      contentFn(doc);

      doc.end();
    });
  }

  private getRequestType(request: any): string {
    if (request.confirmation) return 'Confirmation';
    if (request.promotion) return 'Promotion';
    if (request.lwop) return 'LWOP';
    if (request.cadreChange) return 'Cadre Change';
    if (request.retirement) return 'Retirement';
    if (request.resignation) return 'Resignation';
    if (request.serviceExtension) return 'Service Ext.';
    if (request.separation) return 'Separation';
    return 'Unknown';
  }
}
