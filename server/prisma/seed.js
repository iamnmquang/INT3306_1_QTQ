const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'admin-001',
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isAccountVerified: true,
    },
  });

  console.log('Seeded admin user:', admin);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
