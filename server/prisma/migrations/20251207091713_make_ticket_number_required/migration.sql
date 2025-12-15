/*
  Warnings:

  - Made the column `ticketNumber` on table `ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ticket` MODIFY `ticketNumber` VARCHAR(191) NOT NULL;
