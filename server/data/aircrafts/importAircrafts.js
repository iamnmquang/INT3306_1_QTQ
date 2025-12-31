import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function importCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    name: data.name,
                    manufacturer: data.manufacturer || null
                });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function main() {
    try {
        const filePath = 'data/aircrafts/aircrafts.csv';

        const aircrafts = await importCSV(filePath);

        console.log(`Đọc được ${aircrafts.length} dòng từ CSV`);

        const result = await prisma.aircraft.createMany({
            data: aircrafts,
            skipDuplicates: true
        });

        console.log(`Đã thêm ${result.count} máy bay vào DB`);
    } catch (error) {
        console.error('❌ Lỗi import Aircraft:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
