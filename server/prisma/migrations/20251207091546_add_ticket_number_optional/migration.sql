/*
  Warnings:

  - A unique constraint covering the columns `[ticketNumber]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `ticketNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_ticketNumber_key` ON `Ticket`(`ticketNumber`);
