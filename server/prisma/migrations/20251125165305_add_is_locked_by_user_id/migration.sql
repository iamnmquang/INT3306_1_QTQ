-- AlterTable
ALTER TABLE `seatdetail` ADD COLUMN `isLockedByUserId` VARCHAR(191) NULL,
    ADD COLUMN `lockedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `SeatDetail_lockedAt_idx` ON `SeatDetail`(`lockedAt`);
