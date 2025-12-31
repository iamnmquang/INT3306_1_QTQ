import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                if (
                    !data.flightNumber ||
                    !data.departureIata ||
                    !data.arrivalIata ||
                    !data.aircraftName ||
                    !data.departureTime ||
                    !data.arrivalTime
                ) return;

                results.push({
                    flightNumber: data.flightNumber.trim(),
                    departureIata: data.departureIata.trim(),
                    arrivalIata: data.arrivalIata.trim(),
                    aircraftName: data.aircraftName.trim(),
                    departureTime: new Date(data.departureTime),
                    arrivalTime: new Date(data.arrivalTime)
                });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function main() {
    try {
        const filePath = 'data/flights/flights.csv';

        const flights = await importCSV(filePath);
        console.log(`Đọc được ${flights.length} dòng từ CSV`);

        let success = 0;
        let failed = 0;

        for (const flight of flights) {
            try {
                // ✅ TÌM AIRCRAFT TRƯỚC
                const aircraft = await prisma.aircraft.findFirst({
                    where: { name: flight.aircraftName }
                });

                if (!aircraft) {
                    failed++;
                    console.error(`❌ Không tìm thấy aircraft: ${flight.aircraftName}`);
                    continue;
                }

                await prisma.flight.create({
                    data: {
                        flightNumber: flight.flightNumber,
                        departureTime: flight.departureTime,
                        arrivalTime: flight.arrivalTime,

                        departureAirport: {
                            connect: { iataCode: flight.departureIata }
                        },
                        arrivalAirport: {
                            connect: { iataCode: flight.arrivalIata }
                        },
                        aircraft: {
                            connect: { id: aircraft.id } // ✅ ĐÚNG
                        }
                    }
                });

                success++;
            } catch (err) {
                failed++;
                console.error(
                    `❌ Lỗi flight ${flight.flightNumber}:`,
                    err.message
                );
            }
        }

        console.log(`✅ Đã thêm ${success} flight vào DB`);
        console.log(`❌ Thất bại ${failed} flight`);
    } catch (error) {
        console.error('❌ Lỗi import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
