import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sinh danh sách ghế
 */
function generateSeats(flightSeatId, rows, cols) {
    const seats = [];

    for (const row of rows) {
        for (const col of cols) {
            seats.push({
                seatNumber: `${row}${col}`,
                flightSeatId
            });
        }
    }
    return seats;
}

async function main() {
    try {
        // 1️⃣ Lấy toàn bộ flight đã tạo
        const flights = await prisma.flight.findMany({
            select: {
                id: true,
                flightNumber: true
            }
        });

        console.log(`✈️ Tìm thấy ${flights.length} chuyến bay`);

        for (const flight of flights) {
            console.log(`\n➡️ Tạo ghế cho flight ${flight.flightNumber}`);

            /* ================= FIRST CLASS ================= */
            const firstClass = await prisma.flightSeat.create({
                data: {
                    seatClass: 'FIRST_CLASS',
                    totalSeats: 2,
                    bookedSeats: 0,
                    price: 5000000,
                    flightId: flight.id
                }
            });

            await prisma.seatDetail.createMany({
                data: generateSeats(firstClass.id, [1], ['A', 'B'])
            });

            /* ================= BUSINESS ================= */
            const business = await prisma.flightSeat.create({
                data: {
                    seatClass: 'BUSINESS',
                    totalSeats: 12,
                    bookedSeats: 0,
                    price: 3000000,
                    flightId: flight.id
                }
            });

            await prisma.seatDetail.createMany({
                data: generateSeats(
                    business.id,
                    [2, 3, 4],
                    ['A', 'B', 'C', 'D']
                )
            });

            /* ================= ECONOMY ================= */
            const economy = await prisma.flightSeat.create({
                data: {
                    seatClass: 'ECONOMY',
                    totalSeats: 126,
                    bookedSeats: 0,
                    price: 1200000,
                    flightId: flight.id
                }
            });

            const rows = [];
            for (let i = 10; i <= 30; i++) rows.push(i);

            await prisma.seatDetail.createMany({
                data: generateSeats(
                    economy.id,
                    rows,
                    ['A', 'B', 'C', 'D', 'E', 'F']
                )
            });

            console.log('✅ Xong');
        }

        console.log('\n🎉 ĐÃ TẠO GHẾ CHO TOÀN BỘ FLIGHT');
    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
