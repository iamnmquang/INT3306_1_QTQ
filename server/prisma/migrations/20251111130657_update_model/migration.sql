/*
  Warnings:

  - You are about to drop the column `resetOtp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtpExpireAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verifyOtp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verifyOtpExpireAt` on the `user` table. All the data in the column will be lost.
  - Added the required column `type` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `emailverification` ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `type` ENUM('REGISTER', 'PASSWORD_RESET') NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `resetOtp`,
    DROP COLUMN `resetOtpExpireAt`,
    DROP COLUMN `verifyOtp`,
    DROP COLUMN `verifyOtpExpireAt`;
