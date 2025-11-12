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


   const airportsData = [
    { name: 'Noi Bai International Airport', iataCode: 'HAN', icaoCode: 'VVNB', country: 'Vietnam', city: 'Hanoi', latitude: 21.2212, longitude: 105.8072, type: 'international' },
    { name: 'Tan Son Nhat International Airport', iataCode: 'SGN', icaoCode: 'VVTS', country: 'Vietnam', city: 'Ho Chi Minh City', latitude: 10.8188, longitude: 106.6518, type: 'international' },
    { name: 'Da Nang International Airport', iataCode: 'DAD', icaoCode: 'VVDN', country: 'Vietnam', city: 'Da Nang', latitude: 16.0439, longitude: 108.199, type: 'international' },
  ];

   const airports = [];
  for (const data of airportsData) {
    const airport = await prisma.airport.upsert({
      where: { iataCode: data.iataCode },
      update: {},
      create: data,
    });
    airports.push(airport);
  }
  console.log(`✅ Seeded ${airports.length} airports.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
