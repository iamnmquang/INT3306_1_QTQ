/*
  Warnings:

  - You are about to drop the column `estimatedArrival` on the `flight` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDeparture` on the `flight` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seatDetailId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passengerId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `flight` DROP COLUMN `estimatedArrival`,
    DROP COLUMN `estimatedDeparture`;

-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `seatDetailId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SeatDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seatNumber` VARCHAR(191) NOT NULL,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `flightId` VARCHAR(191) NOT NULL,
    `flightSeatId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_seatDetailId_key` ON `Ticket`(`seatDetailId`);

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_passengerId_key` ON `Ticket`(`passengerId`);

-- AddForeignKey
ALTER TABLE `SeatDetail` ADD CONSTRAINT `SeatDetail_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeatDetail` ADD CONSTRAINT `SeatDetail_flightSeatId_fkey` FOREIGN KEY (`flightSeatId`) REFERENCES `FlightSeat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_seatDetailId_fkey` FOREIGN KEY (`seatDetailId`) REFERENCES `SeatDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
