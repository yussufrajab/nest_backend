import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const institution = await prisma.institution.create({
    data: {
      id: uuidv4(),
      name: 'Ministry of Public Service',
      email: 'mps@example.com',
      phoneNumber: '1234567890',
      voteNumber: '1001',
      tinNumber: 'TIN123456',
    },
  });

  console.log('Created institution:', institution);
}

main()
  .catch((e) => {
    console.error('Error creating institution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
