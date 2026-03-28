import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Zanzibar regions and districts
const regions = [
  'Mjini Magharibi',
  'Kaskazini A',
  'Kaskazini B',
  'Kusini',
  'Kusini Unguja',
  'Pemba Kaskazini',
  'Pemba Kusini',
];

const districts = [
  'Stone Town',
  'Mbweni',
  'Shangani',
  'Michenzani',
  'Fukuchani',
  'Dunga',
  'Kizimkazi',
  'Jambiani',
  'Paje',
  'Nungwi',
  'Kendwa',
  'Wete',
  'Chake Chake',
  'Mkoani',
];

// Zanzibar naming conventions - common names
const firstNames = [
  'Ali',
  'Juma',
  'Khamis',
  'Bakari',
  'Mohammed',
  'Hassan',
  'Abdallah',
  'Suleiman',
  'Rashid',
  'Omar',
  'Ibrahim',
  'Yussuf',
  'Mussa',
  'Hamad',
  'Saleh',
  'Ahmed',
  'Zainab',
  'Fatuma',
  'Aisha',
  'Halima',
  'Mariam',
  'Saada',
  'Rehema',
  'Zahra',
  'Salma',
  'Juma',
  'Bakari',
  'Khalfan',
  'Seif',
  'Ramadhan',
];

const middleNames = [
  'Juma',
  'Ali',
  'Bakari',
  'Khamis',
  'Mohammed',
  'Hassan',
  'Abdallah',
  'Suleiman',
  'Rashid',
  'Omar',
  'Ibrahim',
  'Yussuf',
  'Mussa',
  'Hamad',
  'Saleh',
  'Ahmed',
  'Khalfan',
  'Seif',
  'Ramadhan',
  'Salum',
];

const lastNames = [
  'Ali',
  'Juma',
  'Khamis',
  'Bakari',
  'Mohammed',
  'Hassan',
  'Abdallah',
  'Suleiman',
  'Rashid',
  'Omar',
  'Ibrahim',
  'Yussuf',
  'Mussa',
  'Hamad',
  'Saleh',
  'Ahmed',
  'Khalfan',
  'Seif',
  'Ramadhan',
  'Salum',
  'Makunguza',
  'Othman',
  'Kassim',
  'Idris',
  'Faki',
];

// Employee statuses as per business process document
const employeeStatuses = [
  'On Probation',
  'Confirmed',
  'On LWOP',
  'Retired',
  'Resigned',
  'Terminated',
  'Dismissed',
];

// Generate a random Zanzibar name
function generateName(): string {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${middle} ${last}`;
}

// Generate random date between min and max
function randomDate(min: Date, max: Date): Date {
  return new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime()));
}

// Generate ZAN ID (format: YYYYNNNNN - 9 digits)
function generateZanId(year: number): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `${year}${num}`;
}

// Generate ZSSF number
function generateZssfNumber(): string {
  return `ZSSF${Math.floor(Math.random() * 900000000 + 100000000)}`;
}

// Generate payroll number
function generatePayrollNumber(): string {
  return `TZ${Math.floor(Math.random() * 900000 + 100000)}`;
}

// Get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate phone number (Zanzibar format)
function generatePhoneNumber(): string {
  const prefixes = ['077', '076', '075', '074', '069', '068', '067', '066', '065'];
  const prefix = randomItem(prefixes);
  const num = Math.floor(Math.random() * 9000000 + 1000000);
  return `${prefix}${num}`;
}

// Cadres for civil service
const cadres = [
  'Assistant Officer',
  'Senior Officer',
  'Principal Officer',
  'Deputy Director',
  'Director',
  'Assistant Commissioner',
  'Commissioner',
  'Technical Officer',
  'Senior Technical Officer',
  'Chief Technical Officer',
  'Administrative Assistant',
  'Senior Administrative Assistant',
  'Executive Secretary',
  'Accountant',
  'Senior Accountant',
  'Chief Accountant',
  'Human Resource Officer',
  'Senior Human Resource Officer',
  'IT Officer',
  'Senior IT Officer',
];

const ministries = [
  'Wizara ya Elimu',
  'Wizara ya Afya',
  'Wizara ya Habari',
  'Wizara ya Fedha',
  'Wizara ya Nchi',
  'Wizara ya Ujenzi',
  'Wizara ya Viwanda',
  'Wizara ya Kilimo',
  'Wizara ya Maji',
  'Wizara ya Miundombinu',
];

const departments = [
  'Idara ya Rasilimali Watu',
  'Idara ya Fedha',
  'Idara ya Teknolojia',
  'Idara ya Utawala',
  'Idara ya Mipango',
  'Idara ya Ukaguzi',
  'Idara ya Sheria',
  'Idara ya Mawasiliano',
];

const appointmentTypes = ['Permanent', 'Temporary', 'Contract', 'Probationary'];
const contractTypes = ['Full-time', 'Part-time', 'Fixed-term'];

async function main() {
  console.log('Starting employee seeding...');

  // Get or create institution
  let institution = await prisma.institution.findFirst();
  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        id: uuidv4(),
        name: 'Wizara ya Utumishi wa Umma na Utawala Bora',
        email: 'info@utumishi.go.tz',
        phoneNumber: '022 235 2001',
        voteNumber: '1001',
        tinNumber: 'TIN123456789',
      },
    });
    console.log('Created institution:', institution.name);
  }

  // Create 10 employees for each status (70 total)
  let createdCount = 0;

  for (const status of employeeStatuses) {
    console.log(`\nCreating employees with status: ${status}`);

    for (let i = 0; i < 10; i++) {
      const name = generateName();
      const gender = ['Male', 'Female'][Math.floor(Math.random() * 2)];
      const yearOfBirth = Math.floor(Math.random() * 30) + 1960;
      const yearOfEmployment = status === 'On Probation'
        ? new Date().getFullYear() - Math.floor(Math.random() * 2)
        : Math.floor(Math.random() * 20) + 1995;

      const zanId = generateZanId(yearOfBirth);

      // Check if ZAN ID already exists
      const existingEmployee = await prisma.employee.findFirst({
        where: { zanId },
      });

      if (existingEmployee) {
        console.log(`  Skipping duplicate ZAN ID: ${zanId}`);
        continue;
      }

      // Calculate dates based on status
      let employmentDate: Date;
      let confirmationDate: Date | null = null;
      let retirementDate: Date | null = null;

      switch (status) {
        case 'On Probation':
          employmentDate = randomDate(
            new Date(new Date().getFullYear() - 2, 0, 1),
            new Date(new Date().getFullYear() - 1, 11, 31)
          );
          break;
        case 'Confirmed':
          employmentDate = randomDate(
            new Date(1995, 0, 1),
            new Date(new Date().getFullYear() - 3, 11, 31)
          );
          confirmationDate = new Date(
            employmentDate.getFullYear() + 1,
            employmentDate.getMonth(),
            employmentDate.getDate()
          );
          break;
        case 'On LWOP':
          employmentDate = randomDate(
            new Date(1995, 0, 1),
            new Date(new Date().getFullYear() - 5, 11, 31)
          );
          confirmationDate = new Date(
            employmentDate.getFullYear() + 1,
            employmentDate.getMonth(),
            employmentDate.getDate()
          );
          break;
        case 'Retired':
          employmentDate = randomDate(
            new Date(1980, 0, 1),
            new Date(2000, 11, 31)
          );
          confirmationDate = new Date(
            employmentDate.getFullYear() + 1,
            employmentDate.getMonth(),
            employmentDate.getDate()
          );
          retirementDate = randomDate(
            new Date(new Date().getFullYear() - 5, 0, 1),
            new Date()
          );
          break;
        case 'Resigned':
        case 'Terminated':
        case 'Dismissed':
          employmentDate = randomDate(
            new Date(1995, 0, 1),
            new Date(new Date().getFullYear() - 2, 11, 31)
          );
          confirmationDate = status === 'Dismissed'
            ? null
            : new Date(
                employmentDate.getFullYear() + 1,
                employmentDate.getMonth(),
                employmentDate.getDate()
              );
          break;
        default:
          employmentDate = new Date();
      }

      // Generate date of birth (18-65 years old)
      const dateOfBirth = randomDate(
        new Date(1960, 0, 1),
        new Date(new Date().getFullYear() - 18, 11, 31)
      );

      const employee = await prisma.employee.create({
        data: {
          id: uuidv4(),
          employeeEntityId: `EMP-${Math.floor(Math.random() * 900000) + 100000}`,
          name,
          gender,
          zanId,
          dateOfBirth,
          placeOfBirth: randomItem(districts),
          region: randomItem(regions),
          countryOfBirth: 'Tanzania',
          phoneNumber: generatePhoneNumber(),
          contactAddress: `P.O. Box ${Math.floor(Math.random() * 9000) + 100}, Zanzibar`,
          zssfNumber: generateZssfNumber(),
          payrollNumber: generatePayrollNumber(),
          cadre: randomItem(cadres),
          salaryScale: `TJS ${Math.floor(Math.random() * 10) + 1}`,
          ministry: randomItem(ministries),
          department: randomItem(departments),
          appointmentType: randomItem(appointmentTypes),
          contractType: randomItem(contractTypes),
          recentTitleDate: randomDate(new Date(2020, 0, 1), new Date()),
          currentReportingOffice: 'Director General',
          currentWorkplace: randomItem(districts),
          employmentDate,
          confirmationDate,
          retirementDate,
          status,
          institutionId: institution.id,
        },
      });

      createdCount++;
      console.log(`  [${createdCount}] Created: ${employee.name} - ${employee.zanId} - ${status}`);
    }
  }

  console.log(`\n✅ Successfully created ${createdCount} employees`);
}

main()
  .catch((e) => {
    console.error('Error seeding employees:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
