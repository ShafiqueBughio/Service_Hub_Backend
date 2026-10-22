/*
  Warnings:

  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `notifications` MODIFY `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NULL;

-- CreateTable
CREATE TABLE `identity_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `cnic_front_url` VARCHAR(500) NOT NULL,
    `cnic_back_url` VARCHAR(500) NOT NULL,
    `selfie_url` VARCHAR(500) NOT NULL,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejection_reason` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `identity_verifications_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `notifications_recipient_id_created_at_idx` ON `notifications`(`recipient_id`, `created_at`);

-- AddForeignKey
ALTER TABLE `identity_verifications` ADD CONSTRAINT `identity_verifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `identity_verifications` ADD CONSTRAINT `identity_verifications_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
