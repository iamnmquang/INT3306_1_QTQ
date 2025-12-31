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

  await prisma.seatDetail.deleteMany();
await prisma.flightSeat.deleteMany();
await prisma.flight.deleteMany();


   const airportsData = [
    { name: 'Noi Bai International Airport', iataCode: 'HAN', icaoCode: 'VVNB', country: 'Vietnam', city: 'Hanoi', latitude: 21.2212, longitude: 105.8072, type: 'international' },
    { name: 'Tan Son Nhat International Airport', iataCode: 'SGN', icaoCode: 'VVTS', country: 'Vietnam', city: 'Ho Chi Minh City', latitude: 10.8188, longitude: 106.6518, type: 'international' },
    { name: 'Da Nang International Airport', iataCode: 'DAD', icaoCode: 'VVDN', country: 'Vietnam', city: 'Da Nang', latitude: 16.0439, longitude: 108.199, type: 'international' },
    { 
    name: 'Cam Ranh International Airport', 
    iataCode: 'CXR', 
    icaoCode: 'VVCR', 
    country: 'Vietnam', 
    city: 'Khanh Hoa', 
    latitude: 11.9982, 
    longitude: 109.2196, 
    type: 'international' 
  },
  { 
    name: 'Phu Quoc International Airport', 
    iataCode: 'PQC', 
    icaoCode: 'VVPQ', 
    country: 'Vietnam', 
    city: 'Phu Quoc', 
    latitude: 10.1698, 
    longitude: 103.9931, 
    type: 'international' 
  },
  { 
    name: 'Cat Bi International Airport', 
    iataCode: 'HPH', 
    icaoCode: 'VVCI', 
    country: 'Vietnam', 
    city: 'Hai Phong', 
    latitude: 20.8194, 
    longitude: 106.7249, 
    type: 'international' 
  },
  { 
    name: 'Can Tho International Airport', 
    iataCode: 'VCA', 
    icaoCode: 'VVCT', 
    country: 'Vietnam', 
    city: 'Can Tho', 
    latitude: 10.0851, 
    longitude: 105.7119, 
    type: 'international' 
  },
  { 
    name: 'Lien Khuong Airport', 
    iataCode: 'DLI', 
    icaoCode: 'VVDL', 
    country: 'Vietnam', 
    city: 'Da Lat', 
    latitude: 11.7506, 
    longitude: 108.3738, 
    type: 'domestic' 
  },
  { 
    name: 'Vinh International Airport', 
    iataCode: 'VII', 
    icaoCode: 'VVVH', 
    country: 'Vietnam', 
    city: 'Vinh', 
    latitude: 18.7376, 
    longitude: 105.6711, 
    type: 'domestic' 
  }
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


  const today = new Date();
const y = today.getUTCFullYear();
const m = today.getUTCMonth();
const d = today.getUTCDate();

// Create flights for today and tomorrow with varied times and routes
const tomorrow = new Date(Date.UTC(y, m, d + 1, 0, 0));
await prisma.flight.createMany({
  data: [
    // SGN → HAN (early)
    {
      flightNumber: "VN801",
      departureTime: new Date(Date.UTC(y, m, d, 1, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d, 3, 0)),
      departureAirportId: airports[1].id, // SGN
      arrivalAirportId: airports[0].id,   // HAN
      aircraftId: aircrafts[0].id
    },

    // HAN → DAD (morning)
    {
      flightNumber: "VN225",
      departureTime: new Date(Date.UTC(y, m, d, 4, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d, 5, 20)),
      departureAirportId: airports[0].id, // HAN
      arrivalAirportId: airports[2].id,   // DAD
      aircraftId: aircrafts[1].id
    },

    // DAD → SGN (mid morning)
    {
      flightNumber: "VJC630",
      departureTime: new Date(Date.UTC(y, m, d, 6, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d, 7, 30)),
      departureAirportId: airports[2].id, // DAD
      arrivalAirportId: airports[1].id,   // SGN
      aircraftId: aircrafts[0].id
    },

    // SGN → CXR (midday)
    {
      flightNumber: "BL412",
      departureTime: new Date(Date.UTC(y, m, d, 8, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d, 9, 10)),
      departureAirportId: airports[1].id, // SGN
      arrivalAirportId: airports[3].id,   // CXR
      aircraftId: aircrafts[0].id
    },

    // PQC → HAN (afternoon)
    {
      flightNumber: "VN916",
      departureTime: new Date(Date.UTC(y, m, d, 12, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d, 14, 30)),
      departureAirportId: airports[4].id, // PQC
      arrivalAirportId: airports[0].id,   // HAN
      aircraftId: aircrafts[1].id
    },

    // Additional: HAN → SGN (evening)
    {
      flightNumber: "VN700",
      departureTime: new Date(Date.UTC(y, m, d, 14, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d, 16, 0)),
      departureAirportId: airports[0].id,
      arrivalAirportId: airports[1].id,
      aircraftId: aircrafts[0].id
    },

    // Additional: SGN → HAN (late night, tomorrow)
    {
      flightNumber: "VN999",
      departureTime: new Date(Date.UTC(y, m, d + 1, 1, 0)),
      arrivalTime: new Date(Date.UTC(y, m, d + 1, 3, 0)),
      departureAirportId: airports[1].id,
      arrivalAirportId: airports[0].id,
      aircraftId: aircrafts[1].id
    }
  ],
});

const flights = await prisma.flight.findMany({ orderBy: { departureTime: 'asc' } });

  

  const baseSeats = [
  { seatClass: "ECONOMY", totalSeats: 120, basePrice: 100 },
  { seatClass: "BUSINESS", totalSeats: 40, basePrice: 300 },
];

const flightSeats = [];

for (let i = 0; i < flights.length; i++) {
  const flight = flights[i];
  // vary price by flight index so we have ranges to test
  for (const bs of baseSeats) {
    const priceOffset = i * (bs.seatClass === 'ECONOMY' ? 50 : 100);
    const created = await prisma.flightSeat.create({
      data: {
        seatClass: bs.seatClass,
        totalSeats: bs.totalSeats,
        bookedSeats: 0,
        price: bs.basePrice + priceOffset,
        flightId: flight.id,
      },
    });

    flightSeats.push(created);
  }
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

   await prisma.news.createMany({
    data: [
      {
        title: "Ra mắt hệ thống đặt vé máy bay trực tuyến",
        content:
          "Hệ thống đặt vé máy bay trực tuyến chính thức ra mắt, giúp người dùng tìm kiếm và đặt vé nhanh chóng, tiện lợi.",
        thumbnailUrl:
          "https://example.com/images/news1.jpg",
        isPublished: true,
      },
      {
        title: "Khuyến mãi mùa hè 2025",
        content:
          "Giảm giá lên đến 30% cho các chuyến bay nội địa trong mùa hè 2025.",
        thumbnailUrl:
          "https://example.com/images/news2.jpg",
        isPublished: true,
      },
      {
        title: "Thông báo bảo trì hệ thống",
        content:
          "Hệ thống sẽ được bảo trì từ 00:00 đến 04:00 ngày 15/01/2025.",
        thumbnailUrl: null,
        isPublished: false,
      },
      {
        title: "Mở thêm đường bay mới",
        content:
          "Chúng tôi sắp mở thêm các đường bay mới kết nối các thành phố lớn.",
        thumbnailUrl:
          "https://example.com/images/news3.jpg",
        isPublished: false,
      },
    ],
  });


  console.log("🌱 Seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
