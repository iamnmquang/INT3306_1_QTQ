/*
  Warnings:

  - You are about to drop the column `resetOtp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtpExpireAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyOtp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyOtpExpireAt` on the `User` table. All the data in the column will be lost.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `EmailVerification` ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `type` ENUM('REGISTER', 'PASSWORD_RESET') NOT NULL DEFAULT 'REGISTER';

-- AlterTable
ALTER TABLE `User` DROP COLUMN `resetOtp`,
    DROP COLUMN `resetOtpExpireAt`,
    DROP COLUMN `verifyOtp`,
    DROP COLUMN `verifyOtpExpireAt`,
    MODIFY `password` VARCHAR(191) NOT NULL;
