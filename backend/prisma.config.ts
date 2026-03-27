import dotenv from 'dotenv';

dotenv.config();

/** @type {import('prisma').PrismaClientOptions} */
const config = {
  datasourceUrl: process.env.DATABASE_URL,
};

export default config;
