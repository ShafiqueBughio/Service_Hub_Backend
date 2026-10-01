/*
  Warnings:

  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `reviews` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `social_account_token` TEXT NULL;
