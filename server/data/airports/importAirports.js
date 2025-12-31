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
                if (!data.iataCode || !data.icaoCode) return;

                results.push({
                    name: data.name?.trim(),
                    iataCode: data.iataCode.trim(),
                    icaoCode: data.icaoCode.trim(),
                    country: data.country || null,
                    city: data.city || null,
                    latitude: data.latitude ? parseFloat(data.latitude) : null,
                    longitude: data.longitude ? parseFloat(data.longitude) : null,
                    type: data.type || null
                });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function main() {
    try {
        const filePath = 'data/airports/airports.csv';

        const airports = await importCSV(filePath);
        console.log(`Đọc được ${airports.length} dòng từ CSV`);

        const result = await prisma.airport.createMany({
            data: airports,
            skipDuplicates: true
        });

        console.log(`Đã thêm ${result.count} sân bay vào DB`);
    } catch (error) {
        console.error('❌ Lỗi import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
