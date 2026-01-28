/*
  Warnings:

  - You are about to drop the column `State` on the `user_details` table. All the data in the column will be lost.
  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `user_details` DROP COLUMN `State`,
    ADD COLUMN `state` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NOT NULL;
