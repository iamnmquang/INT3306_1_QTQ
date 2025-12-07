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


  const aircraftData = [
    { name: "Airbus A321", manufacturer: "Airbus" },
    { name: "Boeing 787", manufacturer: "Boeing" }
  ];

  const aircrafts = [];
  for (const ac of aircraftData) {
    const created = await prisma.aircraft.create({
      data: ac
    });
    aircrafts.push(created);
  }


   const flight = await prisma.flight.create({
    data: {
      flightNumber: "VN123",
      departureTime: new Date("2025-02-01T08:00:00.000Z"),
      arrivalTime: new Date("2025-02-01T10:00:00.000Z"),
      arrivalAirportId: airports[0].id,   // HAN
      departureAirportId: airports[1].id, // SGN
      aircraftId: aircrafts[0].id         // Airbus A321
    },
  });

  console.log("✔ Seeded flight:", flight.flightNumber);

  const flightSeatsData = [
    { seatClass: "ECONOMY", totalSeats: 120, bookedSeats: 0, price: 100.0 },
    { seatClass: "BUSINESS", totalSeats: 40, bookedSeats: 0, price: 300.0 }
  ];

  const flightSeats = [];

  for (const fs of flightSeatsData) {
    const created = await prisma.flightSeat.create({
      data: {
        seatClass: fs.seatClass,
        totalSeats: fs.totalSeats,
        bookedSeats: 0,
        price: fs.price,
        flightId: flight.id,
      }
    });

    flightSeats.push(created);
  }

  console.log(`✔ Seeded ${flightSeats.length} flight seat groups.`);

  const seatLetters = ["A", "B", "C", "D", "E", "F"];
  let totalSeatsInserted = 0;

  // ECONOMY: 120 seats = 20 rows × 6 seats
  // BUSINESS: 40 seats = ~7 rows × 6 seats
  const seatStructure = {
    ECONOMY: { rows: 20, cols: 6 },
    BUSINESS: { rows: 7, cols: 6 },
  };

  for (const fs of flightSeats) {
    const structure = seatStructure[fs.seatClass];
    const seats = [];

    for (let row = 1; row <= structure.rows; row++) {
      for (let col = 0; col < structure.cols; col++) {
        const seatNumber = `${row}${seatLetters[col]}`;
        seats.push({
          seatNumber,
          isBooked: false,
          isLocked: false,
          flightSeatId: fs.id,
        });
      }
    }

    await prisma.seatDetail.createMany({
      data: seats,
    });

    totalSeatsInserted += seats.length;
  }

  console.log(`✔ Seeded ${totalSeatsInserted} seat details.`);


  console.log("🌱 Seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
