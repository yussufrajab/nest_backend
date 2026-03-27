import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Define all user roles and corresponding user data
const roles = [
  { role: 'ADMIN', username: 'amina', name: 'Amina Admin', email: 'amina@example.com', phoneNumber: '0987654321' },
  { role: 'HHRMD', username: 'hhrmd', name: 'Head of HR Management Division', email: 'hhrmd@example.com', phoneNumber: '0987654322' },
  { role: 'HRO', username: 'hro', name: 'Human Resources Officer', email: 'hro@example.com', phoneNumber: '0987654323' },
  { role: 'HRMO', username: 'hrmo', name: 'HR Management Officer', email: 'hrmo@example.com', phoneNumber: '0987654324' },
  { role: 'DO', username: 'do', name: 'District Officer', email: 'do@example.com', phoneNumber: '0987654325' },
  { role: 'EMP', username: 'emp', name: 'Employee', email: 'emp@example.com', phoneNumber: '0987654326' },
  { role: 'PO', username: 'po', name: 'Personnel Officer', email: 'po@example.com', phoneNumber: '0987654327' },
  { role: 'CSCS', username: 'cscs', name: 'Civil Service Commission Staff', email: 'cscs@example.com', phoneNumber: '0987654328' },
  { role: 'HRRP', username: 'hrrp', name: 'Human Resources Reporting Person', email: 'hrrp@example.com', phoneNumber: '0987654329' },
];

async function main() {
  // Create an institution (since User requires institutionId)
  let institution = await prisma.institution.findFirst();
  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        id: uuidv4(),
        name: 'Ministry of Public Service',
        email: 'mps@example.com',
        phoneNumber: '1234567890',
        voteNumber: '1001',
        tinNumber: 'TIN123456',
      },
    });
    console.log('Created institution:', institution.name);
  }

  // Hash the password (same for all users)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users for each role
  for (const roleData of roles) {
    const existingUser = await prisma.user.findUnique({
      where: { username: roleData.username },
    });

    if (existingUser) {
      console.log(`User "${roleData.username}" (${roleData.role}) already exists`);
    } else {
      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          name: roleData.name,
          username: roleData.username,
          password: hashedPassword,
          role: roleData.role,
          active: true,
          institutionId: institution.id,
          email: roleData.email,
          phoneNumber: roleData.phoneNumber,
        },
      });
      console.log(`Created user: ${user.username} (${user.role})`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
