-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `invited_contractor_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `jobs_invited_contractor_id_idx` ON `jobs`(`invited_contractor_id`);

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_invited_contractor_id_fkey` FOREIGN KEY (`invited_contractor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
