/*
  Warnings:

  - You are about to drop the column `flightId` on the `seatdetail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `seatdetail` DROP FOREIGN KEY `SeatDetail_flightId_fkey`;

-- DropIndex
DROP INDEX `SeatDetail_flightId_fkey` ON `seatdetail`;

-- AlterTable
ALTER TABLE `seatdetail` DROP COLUMN `flightId`;
