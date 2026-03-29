import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const INSTITUTIONS = [
  { id: 'inst-001', name: 'Ministry of Finance', email: 'finance@gov.zm', phoneNumber: '+255-24-223-1000', voteNumber: 'V001', tinNumber: 'TIN001' },
  { id: 'inst-002', name: 'Ministry of Health', email: 'health@gov.zm', phoneNumber: '+255-24-223-2000', voteNumber: 'V002', tinNumber: 'TIN002' },
  { id: 'inst-003', name: 'Ministry of Education', email: 'education@gov.zm', phoneNumber: '+255-24-223-3000', voteNumber: 'V003', tinNumber: 'TIN003' },
  { id: 'inst-004', name: 'Zanzibar Civil Service Commission', email: 'csc@gov.zm', phoneNumber: '+255-24-223-4000', voteNumber: 'V004', tinNumber: 'TIN004' },
];

const USERS = [
  // Admin users
  { id: 'user-001', name: 'System Administrator', username: 'admin', role: 'ADMIN', password: 'admin123', institutionId: 'inst-004' },

  // HHRMD users
  { id: 'user-002', name: 'Head of HR Management', username: 'hhrmd', role: 'HHRMD', password: 'hhrmd123', institutionId: 'inst-004' },

  // HRMO users
  { id: 'user-003', name: 'HR Management Officer', username: 'hramo', role: 'HRMO', password: 'hramo123', institutionId: 'inst-004' },

  // HRO users
  { id: 'user-004', name: 'HR Officer - Finance', username: 'hro1', role: 'HRO', password: 'hro123', institutionId: 'inst-001' },
  { id: 'user-005', name: 'HR Officer - Health', username: 'hro2', role: 'HRO', password: 'hro123', institutionId: 'inst-002' },
  { id: 'user-006', name: 'HR Officer - Education', username: 'hro3', role: 'HRO', password: 'hro123', institutionId: 'inst-003' },

  // DO users
  { id: 'user-007', name: 'District Officer', username: 'do1', role: 'DO', password: 'do123', institutionId: 'inst-002' },

  // CSCS users
  { id: 'user-008', name: 'CSC Staff', username: 'cscs', role: 'CSCS', password: 'cscs123', institutionId: 'inst-004' },

  // Employee users (will be linked to employees)
  { id: 'user-009', name: 'Ali Hassan', username: 'emp1', role: 'EMPLOYEE', password: 'emp123', institutionId: 'inst-001' },
  { id: 'user-010', name: 'Fatima Mohamed', username: 'emp2', role: 'EMPLOYEE', password: 'emp123', institutionId: 'inst-002' },
  { id: 'user-011', name: 'Omar Juma', username: 'emp3', role: 'EMPLOYEE', password: 'emp123', institutionId: 'inst-003' },
];

const EMPLOYEES = [
  {
    id: 'emp-001',
    name: 'Ali Hassan',
    gender: 'Male',
    zanId: 'ZAN-1985-001',
    phoneNumber: '+255-77-123-4567',
    contactAddress: '123 Malindi Street, Stone Town',
    cadre: 'Senior Accountant',
    salaryScale: 'VII',
    ministry: 'Ministry of Finance',
    department: 'Accounts',
    appointmentType: 'Permanent',
    contractType: 'Indefinite',
    employmentDate: new Date('2015-03-15'),
    status: 'ACTIVE',
    institutionId: 'inst-001',
  },
  {
    id: 'emp-002',
    name: 'Fatima Mohamed',
    gender: 'Female',
    zanId: 'ZAN-1990-002',
    phoneNumber: '+255-77-234-5678',
    contactAddress: '456 Nyerere Road, Mwanakwerekwe',
    cadre: 'Senior Nurse',
    salaryScale: 'VII',
    ministry: 'Ministry of Health',
    department: 'Clinical Services',
    appointmentType: 'Permanent',
    contractType: 'Indefinite',
    employmentDate: new Date('2018-01-10'),
    status: 'ACTIVE',
    institutionId: 'inst-002',
  },
  {
    id: 'emp-003',
    name: 'Omar Juma',
    gender: 'Male',
    zanId: 'ZAN-1988-003',
    phoneNumber: '+255-77-345-6789',
    contactAddress: '789 Mwembesongo, Unguja',
    cadre: 'Senior Teacher',
    salaryScale: 'VI',
    ministry: 'Ministry of Education',
    department: 'Secondary Education',
    appointmentType: 'Permanent',
    contractType: 'Indefinite',
    employmentDate: new Date('2016-06-01'),
    status: 'ACTIVE',
    institutionId: 'inst-003',
  },
  {
    id: 'emp-004',
    name: 'Amina Salum',
    gender: 'Female',
    zanId: 'ZAN-1992-004',
    phoneNumber: '+255-77-456-7890',
    contactAddress: '321 Magomeni, Stone Town',
    cadre: 'Accountant',
    salaryScale: 'VIII',
    ministry: 'Ministry of Finance',
    department: 'Budget',
    appointmentType: 'Permanent',
    contractType: 'Indefinite',
    employmentDate: new Date('2020-09-15'),
    status: 'PROBATION',
    institutionId: 'inst-001',
  },
  {
    id: 'emp-005',
    name: 'Khalid Ibrahim',
    gender: 'Male',
    zanId: 'ZAN-1980-005',
    phoneNumber: '+255-77-567-8901',
    contactAddress: '654 Kikwajuni, Stone Town',
    cadre: 'Director',
    salaryScale: 'IV',
    ministry: 'Ministry of Health',
    department: 'Administration',
    appointmentType: 'Permanent',
    contractType: 'Indefinite',
    employmentDate: new Date('2010-04-20'),
    status: 'ACTIVE',
    institutionId: 'inst-002',
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing data...');
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.confirmationRequest.deleteMany();
  await prisma.promotionRequest.deleteMany();
  await prisma.lwopRequest.deleteMany();
  await prisma.cadreChangeRequest.deleteMany();
  await prisma.retirementRequest.deleteMany();
  await prisma.resignationRequest.deleteMany();
  await prisma.serviceExtensionRequest.deleteMany();
  await prisma.separationRequest.deleteMany();
  await prisma.request.deleteMany();
  await prisma.employeeCertificate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.institution.deleteMany();

  // Create Institutions
  console.log('Creating institutions...');
  for (const institution of INSTITUTIONS) {
    await prisma.institution.create({ data: institution });
  }
  console.log(`✅ Created ${INSTITUTIONS.length} institutions`);

  // Create Employees
  console.log('Creating employees...');
  for (const employee of EMPLOYEES) {
    await prisma.employee.create({ data: employee });
  }
  console.log(`✅ Created ${EMPLOYEES.length} employees`);

  // Create Users with hashed passwords
  console.log('Creating users...');
  for (const user of USERS) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const { password, ...userData } = user;

    // Link employee users to employees
    let employeeId: string | undefined;
    if (user.role === 'EMPLOYEE') {
      if (user.username === 'emp1') employeeId = 'emp-001';
      if (user.username === 'emp2') employeeId = 'emp-002';
      if (user.username === 'emp3') employeeId = 'emp-003';
    }

    await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        employeeId,
      },
    });
  }
  console.log(`✅ Created ${USERS.length} users`);

  // Create Sample Requests
  console.log('Creating sample requests...');
  const sampleRequests = [
    // Confirmation requests
    {
      type: 'confirmation',
      employeeId: 'emp-004',
      submittedById: 'user-004',
      status: 'PENDING',
      reviewStage: 'HRO Review',
      confirmation: {
        proposedConfirmationDate: new Date('2024-06-01'),
        notes: 'Employee has completed 3 years of probationary service',
      },
    },
    {
      type: 'confirmation',
      employeeId: 'emp-001',
      submittedById: 'user-004',
      status: 'APPROVED',
      reviewStage: 'Completed',
      confirmation: {
        proposedConfirmationDate: new Date('2018-03-15'),
        notes: 'Confirmed after probation',
      },
    },
    // Promotion requests
    {
      type: 'promotion',
      employeeId: 'emp-002',
      submittedById: 'user-005',
      status: 'PENDING',
      reviewStage: 'HRMO Review',
      promotion: {
        proposedCadre: 'Principal Nurse',
        promotionType: 'Regular',
        studiedOutsideCountry: false,
      },
    },
    // Retirement request
    {
      type: 'retirement',
      employeeId: 'emp-005',
      submittedById: 'user-005',
      status: 'PENDING',
      reviewStage: 'HHRMD Review',
      retirement: {
        retirementType: 'Age',
        proposedDate: new Date('2025-04-20'),
      },
    },
    // LWOP request
    {
      type: 'lwop',
      employeeId: 'emp-003',
      submittedById: 'user-006',
      status: 'APPROVED',
      reviewStage: 'Completed',
      lwop: {
        duration: '12',
        reason: 'Further Studies',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    },
  ];

  for (const reqData of sampleRequests) {
    const requestId = uuidv4();
    const { type, confirmation, promotion, retirement, lwop, ...baseData } = reqData;

    await prisma.request.create({
      data: {
        id: requestId,
        status: baseData.status,
        reviewStage: baseData.reviewStage,
        documents: [],
        employeeId: baseData.employeeId,
        submittedById: baseData.submittedById,
        ...(confirmation && {
          confirmation: {
            create: {
              id: uuidv4(),
              ...confirmation,
            },
          },
        }),
        ...(promotion && {
          promotion: {
            create: {
              id: uuidv4(),
              ...promotion,
            },
          },
        }),
        ...(retirement && {
          retirement: {
            create: {
              id: uuidv4(),
              ...retirement,
            },
          },
        }),
        ...(lwop && {
          lwop: {
            create: {
              id: uuidv4(),
              ...lwop,
            },
          },
        }),
      },
    });
  }
  console.log(`✅ Created ${sampleRequests.length} sample requests`);

  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('Sample credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  HHRMD: hhrmd / hhrmd123');
  console.log('  HRMO: hramo / hramo123');
  console.log('  HRO: hro1 / hro123 (or hro2, hro3)');
  console.log('  Employee: emp1 / emp123');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
