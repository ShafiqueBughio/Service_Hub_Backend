/*
  Warnings:

  - You are about to alter the column `otp_expiration` on the `user_secrets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `user_details` ADD COLUMN `address` VARCHAR(500) NULL,
    ADD COLUMN `gender` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(255) NULL,
    MODIFY `user_type` ENUM('USER', 'CONTRACTOR', 'ADMIN') NULL;

-- CreateTable
CREATE TABLE `contractor_profile` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `about` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contractor_profile_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contractor_experience` (
    `id` VARCHAR(191) NOT NULL,
    `contractor_profile_id` VARCHAR(191) NOT NULL,
    `company` VARCHAR(255) NULL,
    `job_type` VARCHAR(100) NULL,
    `designation` VARCHAR(255) NULL,
    `start_year` VARCHAR(10) NULL,
    `end_year` VARCHAR(10) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contractor_documents` (
    `id` VARCHAR(191) NOT NULL,
    `contractor_profile_id` VARCHAR(191) NOT NULL,
    `document_type` VARCHAR(100) NOT NULL,
    `document_url` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contractor_portfolio` (
    `id` VARCHAR(191) NOT NULL,
    `contractor_profile_id` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contractor_services` (
    `id` VARCHAR(191) NOT NULL,
    `contractor_profile_id` VARCHAR(191) NOT NULL,
    `service_name` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contractor_service_areas` (
    `id` VARCHAR(191) NOT NULL,
    `contractor_profile_id` VARCHAR(191) NOT NULL,
    `location` VARCHAR(255) NULL,
    `latitude` VARCHAR(191) NULL,
    `longitude` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contractor_profile` ADD CONSTRAINT `contractor_profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractor_experience` ADD CONSTRAINT `contractor_experience_contractor_profile_id_fkey` FOREIGN KEY (`contractor_profile_id`) REFERENCES `contractor_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractor_documents` ADD CONSTRAINT `contractor_documents_contractor_profile_id_fkey` FOREIGN KEY (`contractor_profile_id`) REFERENCES `contractor_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractor_portfolio` ADD CONSTRAINT `contractor_portfolio_contractor_profile_id_fkey` FOREIGN KEY (`contractor_profile_id`) REFERENCES `contractor_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractor_services` ADD CONSTRAINT `contractor_services_contractor_profile_id_fkey` FOREIGN KEY (`contractor_profile_id`) REFERENCES `contractor_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractor_service_areas` ADD CONSTRAINT `contractor_service_areas_contractor_profile_id_fkey` FOREIGN KEY (`contractor_profile_id`) REFERENCES `contractor_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
