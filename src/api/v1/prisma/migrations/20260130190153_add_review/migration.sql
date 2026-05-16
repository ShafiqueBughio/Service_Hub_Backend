/*
  Warnings:

  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[accepted_bid_id]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `accepted_bid_id` VARCHAR(191) NULL,
    ADD COLUMN `completed_at` DATETIME(3) NULL;

-- AlterTable (reviews table is created in next migration 20260131000000_add_review)
ALTER TABLE `user_details` MODIFY `profile_picture` TEXT NULL;

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NOT NULL;

-- CreateTable
CREATE TABLE `bids` (
    `id` VARCHAR(191) NOT NULL,
    `job_id` VARCHAR(191) NOT NULL,
    `contractor_id` VARCHAR(191) NOT NULL,
    `quote_price` DOUBLE NOT NULL,
    `timeline_estimate` VARCHAR(191) NULL,
    `notes` LONGTEXT NULL,
    `proposal_documents` JSON NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `bids_job_id_idx`(`job_id`),
    INDEX `bids_contractor_id_idx`(`contractor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `jobs_accepted_bid_id_key` ON `jobs`(`accepted_bid_id`);

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_accepted_bid_id_fkey` FOREIGN KEY (`accepted_bid_id`) REFERENCES `bids`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_contractor_id_fkey` FOREIGN KEY (`contractor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
