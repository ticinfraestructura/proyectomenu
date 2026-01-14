import { prisma } from '../src/utils/prisma';

beforeAll(async () => {
  // Setup test database connection
});

afterAll(async () => {
  await prisma.$disconnect();
});

jest.setTimeout(30000);
